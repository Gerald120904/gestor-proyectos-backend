import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarFcmTokenDto } from './dto/registrar-fcm-token.dto';
import { FirebasePushService } from './firebase-push.service';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebasePushService: FirebasePushService,
  ) {}

  async registrarToken(userId: number, dto: RegistrarFcmTokenDto) {
    return this.prisma.fcmToken.upsert({
      where: {
        token: dto.token,
      },
      update: {
        userId,
        platform: dto.platform ?? 'android',
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform ?? 'android',
      },
    });
  }

  async enviarPrueba(userId: number) {
    const tokens = await this.prisma.fcmToken.findMany({
      where: {
        userId,
      },
    });

    if (tokens.length === 0) {
      throw new NotFoundException(
        'Este usuario todavía no tiene tokens FCM registrados.',
      );
    }

    const resultados: string[] = [];

    for (const item of tokens) {
      const resultado = await this.firebasePushService.enviarAUnToken({
        token: item.token,
        titulo: 'Gestor de Proyectos',
        cuerpo: 'Esta es una notificación push real enviada desde el backend.',
        data: {
          tipo: 'prueba',
          userId: String(userId),
        },
      });

      resultados.push(resultado as unknown as string);
    }

    return {
      message: 'Notificación de prueba enviada correctamente.',
      totalTokens: tokens.length,
      resultados,
    };
  }
}
