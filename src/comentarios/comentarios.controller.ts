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
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ComentariosController {
	constructor(private readonly comentariosService: ComentariosService) {}

	@Post('proyectos/:proyectoId/comentarios')
	create(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
		@Body() createComentarioDto: CreateComentarioDto,
	) {
		return this.comentariosService.create(
			user.id,
			proyectoId,
			createComentarioDto,
		);
	}

	@Get('proyectos/:proyectoId/comentarios')
	findAllByProyecto(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
	) {
		return this.comentariosService.findAllByProyecto(user.id, proyectoId);
	}

	@Get('comentarios/:id')
	findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.comentariosService.findOne(user.id, id);
	}

	@Patch('comentarios/:id')
	update(
		@CurrentUser() user: any,
		@Param('id', ParseIntPipe) id: number,
		@Body() updateComentarioDto: UpdateComentarioDto,
	) {
		return this.comentariosService.update(user.id, id, updateComentarioDto);
	}

	@Delete('comentarios/:id')
	remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.comentariosService.remove(user.id, id);
	}
}
