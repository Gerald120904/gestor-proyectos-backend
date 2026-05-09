import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Injectable()
export class ComentariosService {
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

	private async validarComentarioDelUsuario(
		userId: number,
		comentarioId: number,
	) {
		const comentario = await this.prisma.comentario.findFirst({
			where: {
				id: comentarioId,
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

		if (!comentario) {
			throw new NotFoundException('Comentario no encontrado.');
		}

		return comentario;
	}

	async create(
		userId: number,
		proyectoId: number,
		createComentarioDto: CreateComentarioDto,
	) {
		await this.validarProyectoDelUsuario(userId, proyectoId);

		return this.prisma.comentario.create({
			data: {
				titulo: createComentarioDto.titulo.trim(),
				contenido: createComentarioDto.contenido.trim(),
				fecha: createComentarioDto.fecha
					? new Date(createComentarioDto.fecha)
					: new Date(),
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

		return this.prisma.comentario.findMany({
			where: {
				proyectoId,
			},
			orderBy: {
				fecha: 'desc',
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

	async findOne(userId: number, id: number) {
		return this.validarComentarioDelUsuario(userId, id);
	}

	async update(
		userId: number,
		id: number,
		updateComentarioDto: UpdateComentarioDto,
	) {
		await this.validarComentarioDelUsuario(userId, id);

		return this.prisma.comentario.update({
			where: {
				id,
			},
			data: {
				titulo: updateComentarioDto.titulo?.trim(),
				contenido: updateComentarioDto.contenido?.trim(),
				fecha: updateComentarioDto.fecha
					? new Date(updateComentarioDto.fecha)
					: undefined,
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
		await this.validarComentarioDelUsuario(userId, id);

		await this.prisma.comentario.delete({
			where: {
				id,
			},
		});

		return {
			message: 'Comentario eliminado correctamente.',
		};
	}
}

