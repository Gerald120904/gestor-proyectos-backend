import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@Injectable()
export class RecordatoriosService {
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

	private async validarRecordatorioDelUsuario(
		userId: number,
		recordatorioId: number,
	) {
		const recordatorio = await this.prisma.recordatorio.findFirst({
			where: {
				id: recordatorioId,
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

		if (!recordatorio) {
			throw new NotFoundException('Recordatorio no encontrado.');
		}

		return recordatorio;
	}

	async create(
		userId: number,
		proyectoId: number,
		createRecordatorioDto: CreateRecordatorioDto,
	) {
		await this.validarProyectoDelUsuario(userId, proyectoId);

		return this.prisma.recordatorio.create({
			data: {
				titulo: createRecordatorioDto.titulo.trim(),
				descripcion: createRecordatorioDto.descripcion.trim(),
				fecha: new Date(createRecordatorioDto.fecha),
				hora: createRecordatorioDto.hora.trim(),
				prioridad: createRecordatorioDto.prioridad ?? 'MEDIA',
				completado: createRecordatorioDto.completado ?? false,
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

	async findAll(userId: number) {
		return this.prisma.recordatorio.findMany({
			where: {
				proyecto: {
					cliente: {
						userId,
					},
				},
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

	async findAllByProyecto(userId: number, proyectoId: number) {
		await this.validarProyectoDelUsuario(userId, proyectoId);

		return this.prisma.recordatorio.findMany({
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
		return this.validarRecordatorioDelUsuario(userId, id);
	}

	async update(
		userId: number,
		id: number,
		updateRecordatorioDto: UpdateRecordatorioDto,
	) {
		await this.validarRecordatorioDelUsuario(userId, id);

		return this.prisma.recordatorio.update({
			where: {
				id,
			},
			data: {
				titulo: updateRecordatorioDto.titulo?.trim(),
				descripcion: updateRecordatorioDto.descripcion?.trim(),
				fecha: updateRecordatorioDto.fecha
					? new Date(updateRecordatorioDto.fecha)
					: undefined,
				hora: updateRecordatorioDto.hora?.trim(),
				prioridad: updateRecordatorioDto.prioridad,
				completado: updateRecordatorioDto.completado,
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

	async toggleCompletado(userId: number, id: number) {
		const recordatorio = await this.validarRecordatorioDelUsuario(userId, id);

		return this.prisma.recordatorio.update({
			where: {
				id,
			},
			data: {
				completado: !recordatorio.completado,
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
		await this.validarRecordatorioDelUsuario(userId, id);

		await this.prisma.recordatorio.delete({
			where: {
				id,
			},
		});

		return {
			message: 'Recordatorio eliminado correctamente.',
		};
	}
}

