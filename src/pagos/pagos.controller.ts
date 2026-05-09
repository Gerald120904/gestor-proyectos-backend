import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { PagosService } from './pagos.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PagosController {
	constructor(private readonly pagosService: PagosService) {}

	@Post('proyectos/:proyectoId/pagos')
	create(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
		@Body() createPagoDto: CreatePagoDto,
	) {
		return this.pagosService.create(user.id, proyectoId, createPagoDto);
	}

	@Get('proyectos/:proyectoId/pagos')
	findAllByProyecto(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
	) {
		return this.pagosService.findAllByProyecto(user.id, proyectoId);
	}

	@Get('pagos/:id')
	findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.pagosService.findOne(user.id, id);
	}

	@Patch('pagos/:id')
	update(
		@CurrentUser() user: any,
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePagoDto: UpdatePagoDto,
	) {
		return this.pagosService.update(user.id, id, updatePagoDto);
	}

	@Delete('pagos/:id')
	remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.pagosService.remove(user.id, id);
	}
}
