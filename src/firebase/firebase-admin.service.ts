import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private app: admin.app.App;

  constructor() {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        throw new InternalServerErrorException(
          'Faltan variables de entorno de Firebase Admin.',
        );
      }

      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      this.app = admin.app();
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      return await this.app.auth().verifyIdToken(idToken);
    } catch {
      throw new InternalServerErrorException(
        'No se pudo verificar el token de Firebase.',
      );
    }
  }
}