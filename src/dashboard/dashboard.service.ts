import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getResumen(userId: number) {
    // Todas las queries corren EN PARALELO en la base de datos
    const [
      totalClientes,
      totalProyectos,
      montoTotalResult,
      montoPagadoResult,
      visitasProximas,
      recordatoriosPendientes,
      estadosResult,
      ultimosProyectos,
    ] = await this.prisma.$transaction([

      // 1. Contar clientes
      this.prisma.cliente.count({
        where: { userId },
      }),

      // 2. Contar proyectos
      this.prisma.proyecto.count({
        where: { cliente: { userId } },
      }),

      // 3. Suma total de proyectos (en la BD, no en JS)
      this.prisma.proyecto.aggregate({
        where: { cliente: { userId } },
        _sum: { montoTotal: true },
      }),

      // 4. Suma de pagos realizados
      this.prisma.pago.aggregate({
        where: { proyecto: { cliente: { userId } } },
        _sum: { monto: true },
      }),

      // 5. Visitas próximas (filtro en la BD)
      this.prisma.visita.count({
        where: {
          proyecto: { cliente: { userId } },
          fecha: { gte: new Date() },
          estado: { notIn: ['CANCELADA', 'REALIZADA'] },
        },
      }),

      // 6. Recordatorios pendientes
      this.prisma.recordatorio.count({
        where: {
          proyecto: { cliente: { userId } },
          completado: false,
        },
      }),

      // 7. Proyectos agrupados por estado
      this.prisma.proyecto.groupBy({
        by: ['estado'],
        where: {
          cliente: {
            userId,
          },
        },
        orderBy: {
          estado: 'asc',
        },
        _count: {
          _all: true,
        },
      }),

      // 8. Últimos 5 proyectos (solo campos necesarios)
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
          pagos: {
            select: { monto: true },
          },
        },
      }),
    ]);

    // Cálculos mínimos en JS (solo los que no puede hacer Prisma)
    const montoTotalProyectos = Number(montoTotalResult._sum.montoTotal ?? 0);
    const montoPagado = Number(montoPagadoResult._sum.monto ?? 0);

    const proyectosPorEstado = { pendiente: 0, activo: 0, finalizado: 0, pausado: 0 };
    for (const grupo of estadosResult) {
      const key = grupo.estado.toLowerCase() as keyof typeof proyectosPorEstado;
      if (key in proyectosPorEstado) {
        proyectosPorEstado[key] =
          typeof grupo._count === 'object' && grupo._count
            ? (grupo._count._all ?? 0)
            : 0;
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