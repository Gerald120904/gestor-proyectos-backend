import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebasePushService implements OnModuleInit {
  private readonly logger = new Logger(FirebasePushService.name);

  onModuleInit() {
    if (getApps().length > 0) {
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase Admin no está configurado. Revisá FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.',
      );
      return;
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    this.logger.log('Firebase Admin inicializado correctamente.');
  }

  async enviarAUnToken(params: {
    token: string;
    titulo: string;
    cuerpo: string;
    data?: Record<string, string>;
  }) {
    const { token, titulo, cuerpo, data } = params;

    return getMessaging().send({
      token,
      notification: {
        title: titulo,
        body: cuerpo,
      },
      data: data ?? {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'recordatorios_channel',
          sound: 'default',
        },
      },
    });
  }
}
