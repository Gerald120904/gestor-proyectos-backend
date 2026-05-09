import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: number, createClienteDto: CreateClienteDto) {
		return this.prisma.cliente.create({
			data: {
				nombre: createClienteDto.nombre.trim(),
				telefono: createClienteDto.telefono.trim(),
				correo: createClienteDto.correo.trim().toLowerCase(),
				direccion: createClienteDto.direccion.trim(),
				userId,
			},
		});
	}

	async findAll(userId: number) {
		return this.prisma.cliente.findMany({
			where: {
				userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				_count: {
					select: {
						proyectos: true,
					},
				},
			},
		});
	}

	async findOne(userId: number, id: number) {
		const cliente = await this.prisma.cliente.findFirst({
			where: {
				id,
				userId,
			},
			include: {
				proyectos: true,
			},
		});

		if (!cliente) {
			throw new NotFoundException('Cliente no encontrado.');
		}

		return cliente;
	}

	async update(userId: number, id: number, updateClienteDto: UpdateClienteDto) {
		const cliente = await this.prisma.cliente.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!cliente) {
			throw new NotFoundException('Cliente no encontrado.');
		}

		return this.prisma.cliente.update({
			where: {
				id,
			},
			data: {
				nombre: updateClienteDto.nombre?.trim(),
				telefono: updateClienteDto.telefono?.trim(),
				correo: updateClienteDto.correo?.trim().toLowerCase(),
				direccion: updateClienteDto.direccion?.trim(),
			},
		});
	}

	async remove(userId: number, id: number) {
		const cliente = await this.prisma.cliente.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!cliente) {
			throw new NotFoundException('Cliente no encontrado.');
		}

		await this.prisma.cliente.delete({
			where: {
				id,
			},
		});

		return {
			message: 'Cliente eliminado correctamente.',
		};
	}
}

