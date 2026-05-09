import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { FirebasePushService } from './firebase-push.service';

@Injectable()
export class RecordatoriosNotificacionesService {
  private readonly logger = new Logger(RecordatoriosNotificacionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebasePushService: FirebasePushService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async notificarRecordatoriosVencidos() {
    const ahora = new Date();

    const recordatorios = await this.prisma.recordatorio.findMany({
      where: {
        completado: false,
        notificacionEnviada: false,
      },
      include: {
        proyecto: {
          include: {
            cliente: {
              include: {
                user: {
                  include: {
                    fcmTokens: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const recordatorio of recordatorios) {
      const fechaHoraRecordatorio = this.construirFechaHora(
        recordatorio.fecha,
        recordatorio.hora,
      );

      if (fechaHoraRecordatorio > ahora) {
        continue;
      }

      const user = recordatorio.proyecto.cliente.user;
      const tokens = user.fcmTokens;

      if (tokens.length === 0) {
        continue;
      }

      const enviados = await this.enviarATokens({
        tokens,
        titulo: 'Gestor de Proyectos',
        cuerpo: `Tenés un recordatorio pendiente: ${recordatorio.titulo}`,
        data: {
          tipo: 'recordatorio_pendiente',
          recordatorioId: String(recordatorio.id),
          proyectoId: String(recordatorio.proyectoId),
        },
      });

      if (enviados > 0) {
        await this.prisma.recordatorio.update({
          where: {
            id: recordatorio.id,
          },
          data: {
            notificacionEnviada: true,
            notificacionEnviadaAt: new Date(),
          },
        });

        this.logger.log(
          `Recordatorio ${recordatorio.id} notificado correctamente.`,
        );
      }
    }
  }

  @Cron('0 8 * * *', {
    timeZone: 'America/Costa_Rica',
  })
  async notificarRecordatoriosDeManana() {
    const ahora = new Date();
    const manana = new Date();

    manana.setDate(ahora.getDate() + 1);
    manana.setHours(0, 0, 0, 0);

    const finManana = new Date(manana);
    finManana.setHours(23, 59, 59, 999);

    const recordatorios = await this.prisma.recordatorio.findMany({
      where: {
        completado: false,
        notificacionMananaEnviada: false,
        fecha: {
          gte: manana,
          lte: finManana,
        },
      },
      include: {
        proyecto: {
          include: {
            cliente: {
              include: {
                user: {
                  include: {
                    fcmTokens: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const recordatorio of recordatorios) {
      const user = recordatorio.proyecto.cliente.user;
      const tokens = user.fcmTokens;

      if (tokens.length === 0) {
        continue;
      }

      const enviados = await this.enviarATokens({
        tokens,
        titulo: 'Gestor de Proyectos',
        cuerpo: `Mañana tenés un recordatorio: ${recordatorio.titulo} a las ${recordatorio.hora}.`,
        data: {
          tipo: 'recordatorio_manana',
          recordatorioId: String(recordatorio.id),
          proyectoId: String(recordatorio.proyectoId),
        },
      });

      if (enviados > 0) {
        await this.prisma.recordatorio.update({
          where: {
            id: recordatorio.id,
          },
          data: {
            notificacionMananaEnviada: true,
            notificacionMananaEnviadaAt: new Date(),
          },
        });

        this.logger.log(
          `Recordatorio ${recordatorio.id} notificado como recordatorio de mañana.`,
        );
      }
    }
  }

  private construirFechaHora(fecha: Date, hora: string): Date {
    const fechaHora = new Date(fecha);

    const partes = hora.split(':');
    const horas = Number(partes[0] ?? 0);
    const minutos = Number(partes[1] ?? 0);

    fechaHora.setHours(horas, minutos, 0, 0);

    return fechaHora;
  }

  private async enviarATokens(params: {
    tokens: Array<{
      id: number;
      token: string;
    }>;
    titulo: string;
    cuerpo: string;
    data: Record<string, string>;
  }): Promise<number> {
    let enviados = 0;

    for (const item of params.tokens) {
      try {
        await this.firebasePushService.enviarAUnToken({
          token: item.token,
          titulo: params.titulo,
          cuerpo: params.cuerpo,
          data: params.data,
        });

        enviados++;
      } catch (error) {
        this.logger.warn(
          `No se pudo enviar notificación al token ${item.id}.`,
        );

        const code = (error as { code?: string })?.code;

        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          await this.prisma.fcmToken.delete({
            where: {
              id: item.id,
            },
          });

          this.logger.warn(`Token FCM ${item.id} eliminado por ser inválido.`);
        }
      }
    }

    return enviados;
  }
}
