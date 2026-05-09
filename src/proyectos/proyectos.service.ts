import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@Injectable()
export class ProyectosService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: number, createProyectoDto: CreateProyectoDto) {
		const cliente = await this.prisma.cliente.findFirst({
			where: {
				id: createProyectoDto.clienteId,
				userId,
			},
		});

		if (!cliente) {
			throw new NotFoundException(
				'Cliente no encontrado o no pertenece al usuario.',
			);
		}

		return this.prisma.proyecto.create({
			data: {
				nombre: createProyectoDto.nombre.trim(),
				descripcion: createProyectoDto.descripcion.trim(),
				montoTotal: createProyectoDto.montoTotal,
				estado: createProyectoDto.estado ?? 'PENDIENTE',
				clienteId: createProyectoDto.clienteId,
			},
			include: {
				cliente: true,
			},
		});
	}

	async findAll(userId: number) {
		return this.prisma.proyecto.findMany({
			where: {
				cliente: {
					userId,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				cliente: true,
				pagos: true,
				visitas: true,
				comentarios: true,
				recordatorios: true,
			},
		});
	}

	async findOne(userId: number, id: number) {
		const proyecto = await this.prisma.proyecto.findFirst({
			where: {
				id,
				cliente: {
					userId,
				},
			},
			include: {
				cliente: true,
				pagos: {
					orderBy: {
						fecha: 'desc',
					},
				},
				visitas: {
					orderBy: {
						fecha: 'asc',
					},
				},
				comentarios: {
					orderBy: {
						fecha: 'desc',
					},
				},
				recordatorios: {
					orderBy: {
						fecha: 'asc',
					},
				},
			},
		});

		if (!proyecto) {
			throw new NotFoundException('Proyecto no encontrado.');
		}

		return proyecto;
	}

	async update(userId: number, id: number, updateProyectoDto: UpdateProyectoDto) {
		const proyecto = await this.prisma.proyecto.findFirst({
			where: {
				id,
				cliente: {
					userId,
				},
			},
		});

		if (!proyecto) {
			throw new NotFoundException('Proyecto no encontrado.');
		}

		if (updateProyectoDto.clienteId) {
			const cliente = await this.prisma.cliente.findFirst({
				where: {
					id: updateProyectoDto.clienteId,
					userId,
				},
			});

			if (!cliente) {
				throw new NotFoundException(
					'Cliente no encontrado o no pertenece al usuario.',
				);
			}
		}

		return this.prisma.proyecto.update({
			where: {
				id,
			},
			data: {
				nombre: updateProyectoDto.nombre?.trim(),
				descripcion: updateProyectoDto.descripcion?.trim(),
				montoTotal: updateProyectoDto.montoTotal,
				estado: updateProyectoDto.estado,
				clienteId: updateProyectoDto.clienteId,
			},
			include: {
				cliente: true,
			},
		});
	}

	async remove(userId: number, id: number) {
		const proyecto = await this.prisma.proyecto.findFirst({
			where: {
				id,
				cliente: {
					userId,
				},
			},
		});

		if (!proyecto) {
			throw new NotFoundException('Proyecto no encontrado.');
		}

		await this.prisma.proyecto.delete({
			where: {
				id,
			},
		});

		return {
			message: 'Proyecto eliminado correctamente.',
		};
	}
}

