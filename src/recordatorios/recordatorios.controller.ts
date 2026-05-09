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
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';
import { RecordatoriosService } from './recordatorios.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class RecordatoriosController {
	constructor(private readonly recordatoriosService: RecordatoriosService) {}

	@Post('proyectos/:proyectoId/recordatorios')
	create(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
		@Body() createRecordatorioDto: CreateRecordatorioDto,
	) {
		return this.recordatoriosService.create(
			user.id,
			proyectoId,
			createRecordatorioDto,
		);
	}

	@Get('recordatorios')
	findAll(@CurrentUser() user: any) {
		return this.recordatoriosService.findAll(user.id);
	}

	@Get('proyectos/:proyectoId/recordatorios')
	findAllByProyecto(
		@CurrentUser() user: any,
		@Param('proyectoId', ParseIntPipe) proyectoId: number,
	) {
		return this.recordatoriosService.findAllByProyecto(user.id, proyectoId);
	}

	@Get('recordatorios/:id')
	findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.recordatoriosService.findOne(user.id, id);
	}

	@Patch('recordatorios/:id')
	update(
		@CurrentUser() user: any,
		@Param('id', ParseIntPipe) id: number,
		@Body() updateRecordatorioDto: UpdateRecordatorioDto,
	) {
		return this.recordatoriosService.update(
			user.id,
			id,
			updateRecordatorioDto,
		);
	}

	@Patch('recordatorios/:id/toggle')
	toggleCompletado(
		@CurrentUser() user: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.recordatoriosService.toggleCompletado(user.id, id);
	}

	@Delete('recordatorios/:id')
	remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.recordatoriosService.remove(user.id, id);
	}
}
