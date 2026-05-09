import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';

@Injectable()
export class VisitasService {
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

	private async validarVisitaDelUsuario(userId: number, visitaId: number) {
		const visita = await this.prisma.visita.findFirst({
			where: {
				id: visitaId,
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

		if (!visita) {
			throw new NotFoundException('Visita no encontrada.');
		}

		return visita;
	}

	async create(
		userId: number,
		proyectoId: number,
		createVisitaDto: CreateVisitaDto,
	) {
		await this.validarProyectoDelUsuario(userId, proyectoId);

		return this.prisma.visita.create({
			data: {
				fecha: new Date(createVisitaDto.fecha),
				hora: createVisitaDto.hora.trim(),
				direccion: createVisitaDto.direccion.trim(),
				estado: createVisitaDto.estado ?? 'PROGRAMADA',
				observacion: createVisitaDto.observacion?.trim(),
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

		return this.prisma.visita.findMany({
			where: {
				proyectoId,
			},
			orderBy: [
				{
					fecha: 'asc',
				},
				{
					hora: 'asc',
				},
			],
			include: {
				proyecto: {
					include: {
						cliente: true,
					},
				},
			},
		});
	}

	async findOne(userId: number, id: number) {
		return this.validarVisitaDelUsuario(userId, id);
	}

	async update(
		userId: number,
		id: number,
		updateVisitaDto: UpdateVisitaDto,
	) {
		await this.validarVisitaDelUsuario(userId, id);

		return this.prisma.visita.update({
			where: {
				id,
			},
			data: {
				fecha: updateVisitaDto.fecha
					? new Date(updateVisitaDto.fecha)
					: undefined,
				hora: updateVisitaDto.hora?.trim(),
				direccion: updateVisitaDto.direccion?.trim(),
				estado: updateVisitaDto.estado,
				observacion: updateVisitaDto.observacion?.trim(),
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
		await this.validarVisitaDelUsuario(userId, id);

		await this.prisma.visita.delete({
			where: {
				id,
			},
		});

		return {
			message: 'Visita eliminada correctamente.',
		};
	}
}

