import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@Injectable()
export class RecordatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, proyectoId: number, dto: CreateRecordatorioDto) {
    // Validar proyecto Y crear en una sola transacción
    const proyecto = await this.prisma.proyecto.findFirst({
      where: { id: proyectoId, cliente: { userId } },
      select: { id: true }, // solo necesitamos saber si existe
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado o no pertenece al usuario.');
    }

    return this.prisma.recordatorio.create({
      data: {
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        fecha: new Date(dto.fecha),
        hora: dto.hora.trim(),
        prioridad: dto.prioridad ?? 'MEDIA',
        completado: dto.completado ?? false,
        proyectoId,
      },
      // Solo incluye lo que Flutter realmente muestra
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fecha: true,
        hora: true,
        prioridad: true,
        completado: true,
        proyectoId: true,
        proyecto: {
          select: {
            id: true,
            nombre: true,
            cliente: { select: { id: true, nombre: true } },
          },
        },
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.recordatorio.findMany({
      where: {
        proyecto: { cliente: { userId } },
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      // Solo campos necesarios, no toda la cadena cliente
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fecha: true,
        hora: true,
        prioridad: true,
        completado: true,
        proyectoId: true,
        proyecto: {
          select: {
            id: true,
            nombre: true,
            cliente: { select: { id: true, nombre: true } },
          },
        },
      },
    });
  }

  async findAllByProyecto(userId: number, proyectoId: number) {
    // Validar y buscar en una sola query
    const proyecto = await this.prisma.proyecto.findFirst({
      where: { id: proyectoId, cliente: { userId } },
      select: { id: true },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado o no pertenece al usuario.');
    }

    return this.prisma.recordatorio.findMany({
      where: { proyectoId },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fecha: true,
        hora: true,
        prioridad: true,
        completado: true,
        proyectoId: true,
      },
    });
  }

  async findOne(userId: number, id: number) {
    const recordatorio = await this.prisma.recordatorio.findFirst({
      where: { id, proyecto: { cliente: { userId } } },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fecha: true,
        hora: true,
        prioridad: true,
        completado: true,
        proyecto: {
          select: {
            id: true,
            nombre: true,
            cliente: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!recordatorio) throw new NotFoundException('Recordatorio no encontrado.');
    return recordatorio;
  }

  async update(userId: number, id: number, dto: UpdateRecordatorioDto) {
    // updateMany con filtro de userId = 0 roundtrips al DB
    const result = await this.prisma.recordatorio.updateMany({
      where: {
        id,
        proyecto: { cliente: { userId } },
      },
      data: {
        titulo: dto.titulo?.trim(),
        descripcion: dto.descripcion?.trim(),
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        hora: dto.hora?.trim(),
        prioridad: dto.prioridad,
        completado: dto.completado,
      },
    });

    if (result.count === 0) throw new NotFoundException('Recordatorio no encontrado.');

    return this.prisma.recordatorio.findUnique({ where: { id } });
  }

  async toggleCompletado(userId: number, id: number) {
    // Buscar y actualizar en 2 queries pero sin la query de validación extra
    const recordatorio = await this.prisma.recordatorio.findFirst({
      where: { id, proyecto: { cliente: { userId } } },
      select: { id: true, completado: true },
    });

    if (!recordatorio) throw new NotFoundException('Recordatorio no encontrado.');

    return this.prisma.recordatorio.update({
      where: { id },
      data: { completado: !recordatorio.completado },
      select: { id: true, completado: true },
    });
  }

  async remove(userId: number, id: number) {
    const result = await this.prisma.recordatorio.deleteMany({
      where: {
        id,
        proyecto: { cliente: { userId } },
      },
    });

    if (result.count === 0) throw new NotFoundException('Recordatorio no encontrado.');

    return { message: 'Recordatorio eliminado correctamente.' };
  }
}