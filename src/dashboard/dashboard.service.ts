import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getResumen(userId: number) {
    // Promise.all en vez de $transaction — soporta groupBy y sigue siendo paralelo
    const [
      totalClientes,
      totalProyectos,
      montoTotalResult,
      montoPagadoResult,
      visitasProximas,
      recordatoriosPendientes,
      estadosResult,
      ultimosProyectos,
    ] = await Promise.all([

      this.prisma.cliente.count({
        where: { userId },
      }),

      this.prisma.proyecto.count({
        where: { cliente: { userId } },
      }),

      this.prisma.proyecto.aggregate({
        where: { cliente: { userId } },
        _sum: { montoTotal: true },
      }),

      this.prisma.pago.aggregate({
        where: { proyecto: { cliente: { userId } } },
        _sum: { monto: true },
      }),

      this.prisma.visita.count({
        where: {
          proyecto: { cliente: { userId } },
          fecha: { gte: new Date() },
          estado: { notIn: ['CANCELADA', 'REALIZADA'] },
        },
      }),

      this.prisma.recordatorio.count({
        where: {
          proyecto: { cliente: { userId } },
          completado: false,
        },
      }),

      this.prisma.proyecto.groupBy({
        by: ['estado'],
        where: { cliente: { userId } },
        _count: { estado: true },
      }),

      this.prisma.proyecto.findMany({
        where: { cliente: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          nombre: true,
          estado: true,
          montoTotal: true,
          createdAt: true,
          pagos: { select: { monto: true } },
        },
      }),
    ]);

    const montoTotalProyectos = Number(montoTotalResult._sum.montoTotal ?? 0);
    const montoPagado = Number(montoPagadoResult._sum.monto ?? 0);

    const proyectosPorEstado = { pendiente: 0, activo: 0, finalizado: 0, pausado: 0 };
    for (const grupo of estadosResult) {
      const key = grupo.estado.toLowerCase() as keyof typeof proyectosPorEstado;
      if (key in proyectosPorEstado) {
        proyectosPorEstado[key] = grupo._count.estado;
      }
    }

    return {
      totalClientes,
      totalProyectos,
      montoTotalProyectos,
      montoPagado,
      montoPendiente: montoTotalProyectos - montoPagado,
      visitasProximas,
      recordatoriosPendientes,
      proyectosPorEstado,
      ultimosProyectos: ultimosProyectos.map((p) => {
        const totalPagado = p.pagos.reduce((s, pago) => s + Number(pago.monto), 0);
        const montoTotal = Number(p.montoTotal);
        return {
          id: p.id,
          nombre: p.nombre,
          estado: p.estado,
          montoTotal,
          totalPagado,
          montoPendiente: montoTotal - totalPagado,
          createdAt: p.createdAt,
        };
      }),
    };
  }
}