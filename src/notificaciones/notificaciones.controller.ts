import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RegistrarFcmTokenDto } from './dto/registrar-fcm-token.dto';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
  ) {}

  @Post('registrar-token')
  registrarToken(@Req() req: any, @Body() dto: RegistrarFcmTokenDto) {
    const userId = Number(req.user.sub ?? req.user.id);

    return this.notificacionesService.registrarToken(userId, dto);
  }

  @Post('prueba')
  enviarPrueba(@Req() req: any) {
    const userId = Number(req.user.sub ?? req.user.id);

    return this.notificacionesService.enviarPrueba(userId);
  }
}
