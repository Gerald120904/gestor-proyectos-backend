import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) {}

	async getResumen(userId: number) {
		const clientes = await this.prisma.cliente.findMany({
			where: {
				userId,
			},
			include: {
				proyectos: {
					include: {
						pagos: true,
						visitas: true,
						recordatorios: true,
					},
				},
			},
		});

		const totalClientes = clientes.length;

		const proyectos = clientes.flatMap((cliente) => cliente.proyectos);

		const totalProyectos = proyectos.length;

		const montoTotalProyectos = proyectos.reduce((total, proyecto) => {
			return total + Number(proyecto.montoTotal);
		}, 0);

		const pagos = proyectos.flatMap((proyecto) => proyecto.pagos);

		const montoPagado = pagos.reduce((total, pago) => {
			return total + Number(pago.monto);
		}, 0);

		const montoPendiente = montoTotalProyectos - montoPagado;

		const hoy = new Date();
		hoy.setHours(0, 0, 0, 0);

		const visitas = proyectos.flatMap((proyecto) => proyecto.visitas);

		const visitasProximas = visitsFilterCount(visitas, hoy);

		const recordatorios = proyectos.flatMap(
			(proyecto) => proyecto.recordatorios,
		);

		const recordatoriosPendientes = recordatorios.filter(
			(recordatorio) => !recordatorio.completado,
		).length;

		const proyectosPorEstado = {
			pendiente: proyectos.filter((proyecto) => proyecto.estado === 'PENDIENTE')
				.length,
			activo: proyectos.filter((proyecto) => proyecto.estado === 'ACTIVO')
				.length,
			finalizado: proyectos.filter(
				(proyecto) => proyecto.estado === 'FINALIZADO',
			).length,
			pausado: proyectos.filter((proyecto) => proyecto.estado === 'PAUSADO')
				.length,
		};

		const ultimosProyectos = proyectos
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.slice(0, 5)
			.map((proyecto) => {
				const totalPagadoProyecto = proyecto.pagos.reduce((total, pago) => {
					return total + Number(pago.monto);
				}, 0);

				const montoTotalProyecto = Number(proyecto.montoTotal);

				return {
					id: proyecto.id,
					nombre: proyecto.nombre,
					estado: proyecto.estado,
					montoTotal: montoTotalProyecto,
					totalPagado: totalPagadoProyecto,
					montoPendiente: montoTotalProyecto - totalPagadoProyecto,
					createdAt: proyecto.createdAt,
				};
			});

		return {
			totalClientes,
			totalProyectos,
			montoTotalProyectos,
			montoPagado,
			montoPendiente,
			visitasProximas,
			recordatoriosPendientes,
			proyectosPorEstado,
			ultimosProyectos,
		};
	}
}

function visitsFilterCount(visitas: any[], hoy: Date) {
	return visitas.filter((visita) => {
		const fechaVisita = new Date(visita.fecha);
		fechaVisita.setHours(0, 0, 0, 0);

		return (
			fechaVisita >= hoy &&
			visita.estado !== 'CANCELADA' &&
			visita.estado !== 'REALIZADA'
		);
	}).length;
}
