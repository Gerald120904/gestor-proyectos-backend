import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';

type DateRange = {
  start: Date;
  end: Date;
  label: string;
  period: string;
};

type ChartItem = {
  label: string;
  value: number;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGeneralReport(query: ReportQueryDto) {
    const range = this.resolveRange(query);
    const db = this.prisma as any;

    const [proyectos, pagosPeriodo, clientes] = await Promise.all([
      db.proyecto.findMany({
        include: {
          cliente: true,
          pagos: true,
          visitas: true,
          recordatorios: true,
        },
        orderBy: {
          id: 'desc',
        },
      }),
      db.pago.findMany({
        where: {
          fecha: {
            gte: range.start,
            lte: range.end,
          },
        },
        include: {
          proyecto: {
            include: {
              cliente: true,
            },
          },
        },
        orderBy: {
          fecha: 'desc',
        },
      }),
      db.cliente.findMany({
        orderBy: {
          id: 'desc',
        },
      }),
    ]);

    const totalIngresosPeriodo = this.sum(pagosPeriodo, 'monto');

    const proyectosConCalculos = proyectos.map((proyecto: any) => {
      const montoTotal = this.toNumber(proyecto.montoTotal);
      const pagos = Array.isArray(proyecto.pagos) ? proyecto.pagos : [];
      const totalPagado = this.sum(pagos, 'monto');
      const saldoPendiente = Math.max(montoTotal - totalPagado, 0);

      return {
        ...proyecto,
        montoTotalCalculado: montoTotal,
        totalPagadoCalculado: totalPagado,
        saldoPendienteCalculado: saldoPendiente,
      };
    });

    const montoTotalProyectos = proyectosConCalculos.reduce(
      (total: number, proyecto: any) => total + proyecto.montoTotalCalculado,
      0,
    );

    const totalPagadoHistorico = proyectosConCalculos.reduce(
      (total: number, proyecto: any) => total + proyecto.totalPagadoCalculado,
      0,
    );

    const saldoPendienteTotal = proyectosConCalculos.reduce(
      (total: number, proyecto: any) => total + proyecto.saldoPendienteCalculado,
      0,
    );

    const visitasPeriodo = this.extractRelatedItemsInRange(
      proyectos,
      'visitas',
      'fecha',
      range,
    );

    const recordatorios = this.extractRelatedItems(proyectos, 'recordatorios');
    const recordatoriosPeriodo = recordatorios.filter((item: any) =>
      this.isDateInRange(item.fecha, range),
    );

    const clientesNuevosPeriodo = clientes.filter((cliente: any) => {
      if (!cliente.createdAt) return false;
      return this.isDateInRange(cliente.createdAt, range);
    });

    const now = new Date();
    const recordatoriosVencidos = recordatorios.filter((recordatorio: any) => {
      if (recordatorio.completado === true) return false;
      const fechaHora = this.combineDateAndTime(recordatorio.fecha, recordatorio.hora);
      if (!fechaHora) return false;
      return fechaHora.getTime() < now.getTime();
    });

    const proyectosPorEstado = this.countBy(proyectos, 'estado');
    const pagosPorMetodo = this.sumBy(pagosPeriodo, 'metodo', 'monto');
    const visitasPorEstado = this.countBy(visitasPeriodo, 'estado');
    const recordatoriosPorEstado = this.buildRecordatoriosStatus(recordatoriosPeriodo, now);

    const topProyectosPorIngreso = proyectosConCalculos
      .slice()
      .sort(
        (a: any, b: any) => b.totalPagadoCalculado - a.totalPagadoCalculado,
      )
      .slice(0, 5)
      .map((proyecto: any) => ({
        id: proyecto.id,
        nombre: proyecto.nombre,
        cliente: proyecto.cliente?.nombre ?? 'Sin cliente',
        montoTotal: proyecto.montoTotalCalculado,
        totalPagado: proyecto.totalPagadoCalculado,
        saldoPendiente: proyecto.saldoPendienteCalculado,
      }));

    const proyectosConSaldoPendiente = proyectosConCalculos
      .filter((proyecto: any) => proyecto.saldoPendienteCalculado > 0)
      .sort(
        (a: any, b: any) => b.saldoPendienteCalculado - a.saldoPendienteCalculado,
      )
      .slice(0, 10)
      .map((proyecto: any) => ({
        id: proyecto.id,
        nombre: proyecto.nombre,
        estado: proyecto.estado,
        cliente: proyecto.cliente?.nombre ?? 'Sin cliente',
        montoTotal: proyecto.montoTotalCalculado,
        totalPagado: proyecto.totalPagadoCalculado,
        saldoPendiente: proyecto.saldoPendienteCalculado,
      }));

    const pagosRecientes = pagosPeriodo.slice(0, 10).map((pago: any) => ({
      id: pago.id,
      monto: this.toNumber(pago.monto),
      fecha: pago.fecha,
      metodo: pago.metodo,
      observacion: pago.observacion ?? '',
      proyecto: pago.proyecto?.nombre ?? 'Sin proyecto',
      cliente: pago.proyecto?.cliente?.nombre ?? 'Sin cliente',
    }));

    return {
      range: {
        period: range.period,
        label: range.label,
        start: range.start,
        end: range.end,
      },
      summary: {
        totalIngresosPeriodo,
        montoTotalProyectos,
        totalPagadoHistorico,
        saldoPendienteTotal,
        totalClientes: clientes.length,
        clientesNuevosPeriodo: clientesNuevosPeriodo.length,
        totalProyectos: proyectos.length,
        proyectosActivos: proyectos.filter(
          (proyecto: any) => proyecto.estado === 'ACTIVO',
        ).length,
        proyectosPendientes: proyectos.filter(
          (proyecto: any) => proyecto.estado === 'PENDIENTE',
        ).length,
        proyectosPausados: proyectos.filter(
          (proyecto: any) => proyecto.estado === 'PAUSADO',
        ).length,
        proyectosFinalizados: proyectos.filter(
          (proyecto: any) => proyecto.estado === 'FINALIZADO',
        ).length,
        visitasPeriodo: visitasPeriodo.length,
        visitasRealizadasPeriodo: visitasPeriodo.filter(
          (visita: any) => visita.estado === 'REALIZADA',
        ).length,
        recordatoriosPeriodo: recordatoriosPeriodo.length,
        recordatoriosPendientes: recordatorios.filter(
          (recordatorio: any) => recordatorio.completado !== true,
        ).length,
        recordatoriosCompletadosPeriodo: recordatoriosPeriodo.filter(
          (recordatorio: any) => recordatorio.completado === true,
        ).length,
        recordatoriosVencidos: recordatoriosVencidos.length,
      },
      charts: {
        ingresosPorPeriodo: this.buildMoneyTimeline(pagosPeriodo, range, 'monto', 'fecha'),
        proyectosPorEstado: this.mapToChart(proyectosPorEstado),
        cobradoVsPendiente: [
          { label: 'Cobrado', value: totalPagadoHistorico },
          { label: 'Pendiente', value: saldoPendienteTotal },
        ],
        pagosPorMetodo: this.mapToChart(pagosPorMetodo),
        visitasPorEstado: this.mapToChart(visitasPorEstado),
        recordatoriosPorEstado: this.mapToChart(recordatoriosPorEstado),
        clientesNuevosPorPeriodo: this.buildCountTimeline(
          clientesNuevosPeriodo,
          range,
          'createdAt',
        ),
        topProyectosPorIngreso: topProyectosPorIngreso.map((proyecto: any) => ({
          label: proyecto.nombre,
          value: proyecto.totalPagado,
        })),
      },
      tables: {
        pagosRecientes,
        proyectosConSaldoPendiente,
        topProyectosPorIngreso,
      },
    };
  }

  private resolveRange(query: ReportQueryDto): DateRange {
    const period = query.period ?? 'month';
    const now = new Date();

    if (period === 'custom') {
      if (!query.startDate || !query.endDate) {
        throw new BadRequestException(
          'Para un reporte personalizado debe enviar startDate y endDate.',
        );
      }

      const start = this.startOfDay(new Date(query.startDate));
      const end = this.endOfDay(new Date(query.endDate));

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new BadRequestException('Las fechas del reporte no son válidas.');
      }

      if (start.getTime() > end.getTime()) {
        throw new BadRequestException(
          'La fecha inicial no puede ser mayor que la fecha final.',
        );
      }

      return {
        start,
        end,
        label: `${this.formatDate(start)} - ${this.formatDate(end)}`,
        period,
      };
    }

    if (period === 'today') {
      return {
        start: this.startOfDay(now),
        end: this.endOfDay(now),
        label: 'Hoy',
        period,
      };
    }

    if (period === 'week') {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const start = this.startOfDay(
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday),
      );
      const end = this.endOfDay(
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6),
      );

      return {
        start,
        end,
        label: 'Esta semana',
        period,
      };
    }

    if (period === 'year') {
      return {
        start: this.startOfDay(new Date(now.getFullYear(), 0, 1)),
        end: this.endOfDay(new Date(now.getFullYear(), 11, 31)),
        label: `Año ${now.getFullYear()}`,
        period,
      };
    }

    return {
      start: this.startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: this.endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      label: 'Este mes',
      period: 'month',
    };
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  private endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  private toNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value) || 0;
    if (typeof value?.toNumber === 'function') return value.toNumber();
    if (typeof value?.toString === 'function') return Number(value.toString()) || 0;
    return 0;
  }

  private sum(items: any[], field: string): number {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + this.toNumber(item?.[field]), 0);
  }

  private countBy(items: any[], field: string): Record<string, number> {
    const result: Record<string, number> = {};

    for (const item of items ?? []) {
      const key = item?.[field]?.toString() || 'SIN_DATO';
      result[key] = (result[key] ?? 0) + 1;
    }

    return result;
  }

  private sumBy(items: any[], groupField: string, amountField: string): Record<string, number> {
    const result: Record<string, number> = {};

    for (const item of items ?? []) {
      const key = item?.[groupField]?.toString() || 'SIN_DATO';
      result[key] = (result[key] ?? 0) + this.toNumber(item?.[amountField]);
    }

    return result;
  }

  private mapToChart(data: Record<string, number>): ChartItem[] {
    return Object.entries(data).map(([label, value]) => ({ label, value }));
  }

  private extractRelatedItems(items: any[], relationName: string): any[] {
    const result: any[] = [];

    for (const item of items ?? []) {
      const relation = item?.[relationName];
      if (Array.isArray(relation)) {
        result.push(...relation);
      }
    }

    return result;
  }

  private extractRelatedItemsInRange(
    items: any[],
    relationName: string,
    dateField: string,
    range: DateRange,
  ): any[] {
    return this.extractRelatedItems(items, relationName).filter((item) =>
      this.isDateInRange(item?.[dateField], range),
    );
  }

  private isDateInRange(value: any, range: DateRange): boolean {
    if (!value) return false;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    return date.getTime() >= range.start.getTime() && date.getTime() <= range.end.getTime();
  }

  private buildMoneyTimeline(
    items: any[],
    range: DateRange,
    amountField: string,
    dateField: string,
  ): ChartItem[] {
    const buckets = this.buildEmptyBuckets(range);

    for (const item of items ?? []) {
      const date = new Date(item?.[dateField]);
      if (Number.isNaN(date.getTime())) continue;

      const key = this.getBucketKey(date, range);
      buckets[key] = (buckets[key] ?? 0) + this.toNumber(item?.[amountField]);
    }

    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
  }

  private buildCountTimeline(items: any[], range: DateRange, dateField: string): ChartItem[] {
    const buckets = this.buildEmptyBuckets(range);

    for (const item of items ?? []) {
      const date = new Date(item?.[dateField]);
      if (Number.isNaN(date.getTime())) continue;

      const key = this.getBucketKey(date, range);
      buckets[key] = (buckets[key] ?? 0) + 1;
    }

    return Object.entries(buckets).map(([label, value]) => ({ label, value }));
  }

  private buildEmptyBuckets(range: DateRange): Record<string, number> {
    const buckets: Record<string, number> = {};
    const diffDays = Math.ceil(
      (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (range.period === 'today') {
      for (let hour = 0; hour < 24; hour++) {
        buckets[`${hour.toString().padStart(2, '0')}:00`] = 0;
      }
      return buckets;
    }

    if (diffDays <= 45) {
      const cursor = new Date(range.start);
      while (cursor.getTime() <= range.end.getTime()) {
        buckets[this.formatDateShort(cursor)] = 0;
        cursor.setDate(cursor.getDate() + 1);
      }
      return buckets;
    }

    const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
    while (cursor.getTime() <= range.end.getTime()) {
      buckets[this.formatMonth(cursor)] = 0;
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
  }

  private getBucketKey(date: Date, range: DateRange): string {
    if (range.period === 'today') {
      return `${date.getHours().toString().padStart(2, '0')}:00`;
    }

    const diffDays = Math.ceil(
      (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 45) {
      return this.formatDateShort(date);
    }

    return this.formatMonth(date);
  }

  private buildRecordatoriosStatus(recordatorios: any[], now: Date): Record<string, number> {
    const result = {
      PENDIENTE: 0,
      COMPLETADO: 0,
      VENCIDO: 0,
    };

    for (const recordatorio of recordatorios ?? []) {
      if (recordatorio?.completado === true) {
        result.COMPLETADO += 1;
        continue;
      }

      const fechaHora = this.combineDateAndTime(recordatorio?.fecha, recordatorio?.hora);
      if (fechaHora && fechaHora.getTime() < now.getTime()) {
        result.VENCIDO += 1;
      } else {
        result.PENDIENTE += 1;
      }
    }

    return result;
  }

  private combineDateAndTime(dateValue: any, timeValue: any): Date | null {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;

    const timeText = timeValue?.toString() ?? '00:00';
    const [hoursText, minutesText] = timeText.split(':');
    const hours = Number(hoursText) || 0;
    const minutes = Number(minutesText) || 0;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      0,
      0,
    );
  }

  private formatDate(date: Date): string {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  }

  private formatDateShort(date: Date): string {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  }

  private formatMonth(date: Date): string {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }
}
