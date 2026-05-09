import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebasePushService } from './firebase-push.service';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { RecordatoriosNotificacionesService } from './recordatorios-notificaciones.service';

@Module({
  controllers: [NotificacionesController],
  providers: [
    PrismaService,
    FirebasePushService,
    NotificacionesService,
    RecordatoriosNotificacionesService,
  ],
  exports: [
    FirebasePushService,
    NotificacionesService,
  ],
})
export class NotificacionesModule {}
