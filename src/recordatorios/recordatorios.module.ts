import { Module } from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service';
import { RecordatoriosController } from './recordatorios.controller';

@Module({
  providers: [RecordatoriosService],
  controllers: [RecordatoriosController]
})
export class RecordatoriosModule {}
