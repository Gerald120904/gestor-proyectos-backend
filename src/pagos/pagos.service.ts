import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class PagosService {
	constructor(private readonly prisma: PrismaService) {}

	private async validarProyectoDelUsuario(userId: number, proyectoId: number) {
		const proyecto = await this.prisma.proyecto.findFirst({
			where: {
				id: proyectoId,
				cliente: {
					userId,
				},
			},
		});

		if (!proyecto) {
			throw new NotFoundException(
				'Proyecto no encontrado o no pertenece al usuario.',
			);
		}

		return proyecto;
	}

	private async validarPagoDelUsuario(userId: number, pagoId: number) {
		const pago = await this.prisma.pago.findFirst({
			where: {
				id: pagoId,
				proyecto: {
					cliente: {
						userId,
					},
				},
			},
			include: {
				proyecto: {
					include: {
						cliente: true,
					},
				},
			},
		});

		if (!pago) {
			throw new NotFoundException('Pago no encontrado.');
		}

		return pago;
	}

	async create(userId: number, proyectoId: number, createPagoDto: CreatePagoDto) {
		await this.validarProyectoDelUsuario(userId, proyectoId);

		return this.prisma.pago.create({
			data: {
				monto: createPagoDto.monto,
				fecha: new Date(createPagoDto.fecha),
				metodo: createPagoDto.metodo,
				observacion: createPagoDto.observacion?.trim(),
				proyectoId,
			},
			include: {
				proyecto: {
					include: {
						cliente: true,
					},
				},
			},
		});
	}

	async findAllByProyecto(userId: number, proyectoId: number) {
		await this.validarProyectoDelUsuario(userId, proyectoId);

		const proyecto = await this.prisma.proyecto.findUnique({
			where: {
				id: proyectoId,
			},
			include: {
				pagos: {
					orderBy: {
						fecha: 'desc',
					},
				},
			},
		});

		if (!proyecto) {
			throw new NotFoundException('Proyecto no encontrado.');
		}

		const totalPagado = proyecto.pagos.reduce((total, pago) => {
			return total + Number(pago.monto);
		}, 0);

		const montoTotal = Number(proyecto.montoTotal);
		const montoPendiente = montoTotal - totalPagado;

		return {
			proyecto: {
				id: proyecto.id,
				nombre: proyecto.nombre,
				montoTotal,
				totalPagado,
				montoPendiente,
			},
			pagos: proyecto.pagos,
		};
	}

	async findOne(userId: number, id: number) {
		return this.validarPagoDelUsuario(userId, id);
	}

	async update(userId: number, id: number, updatePagoDto: UpdatePagoDto) {
		await this.validarPagoDelUsuario(userId, id);

		return this.prisma.pago.update({
			where: {
				id,
			},
			data: {
				monto: updatePagoDto.monto,
				fecha: updatePagoDto.fecha ? new Date(updatePagoDto.fecha) : undefined,
				metodo: updatePagoDto.metodo,
				observacion: updatePagoDto.observacion?.trim(),
			},
			include: {
				proyecto: {
					include: {
						cliente: true,
					},
				},
			},
		});
	}

	async remove(userId: number, id: number) {
		await this.validarPagoDelUsuario(userId, id);

		await this.prisma.pago.delete({
			where: {
				id,
			},
		});

		return {
			message: 'Pago eliminado correctamente.',
		};
	}
}

