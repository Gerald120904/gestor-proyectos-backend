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
import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';
import { VisitasService } from './visitas.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class VisitasController {
	constructor(private readonly visitasService: VisitasService) {}

	@Post('proyectos/:proyectoId/visitas')
	create(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
		@Body() createVisitaDto: CreateVisitaDto,
	) {
		return this.visitasService.create(user.id, proyectoId, createVisitaDto);
	}

	@Get('proyectos/:proyectoId/visitas')
	findAllByProyecto(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
	) {
		return this.visitasService.findAllByProyecto(user.id, proyectoId);
	}

	@Get('visitas/:id')
	findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.visitasService.findOne(user.id, id);
	}

	@Patch('visitas/:id')
	update(
		@CurrentUser() user: any,
		@Param('id', ParseIntPipe) id: number,
		@Body() updateVisitaDto: UpdateVisitaDto,
	) {
		return this.visitasService.update(user.id, id, updateVisitaDto);
	}

	@Delete('visitas/:id')
	remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.visitasService.remove(user.id, id);
	}
}
