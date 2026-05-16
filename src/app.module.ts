import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { PagosModule } from './pagos/pagos.module';
import { VisitasModule } from './visitas/visitas.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { RecordatoriosModule } from './recordatorios/recordatorios.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    HealthModule,

    PrismaModule,
    AuthModule,
    ClientesModule,
    ProyectosModule,
    PagosModule,
    VisitasModule,
    ComentariosModule,
    RecordatoriosModule,
    DashboardModule,
    NotificacionesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}