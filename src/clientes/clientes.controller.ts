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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
	constructor(private readonly clientesService: ClientesService) {}

	@Post()
	create(@CurrentUser() user: any, @Body() createClienteDto: CreateClienteDto) {
		return this.clientesService.create(user.id, createClienteDto);
	}

	@Get()
	findAll(@CurrentUser() user: any) {
		return this.clientesService.findAll(user.id);
	}

	@Get(':id')
	findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.clientesService.findOne(user.id, id);
	}

	@Patch(':id')
	update(
		@CurrentUser() user: any,
		@Param('id', ParseIntPipe) id: number,
		@Body() updateClienteDto: UpdateClienteDto,
	) {
		return this.clientesService.update(user.id, id, updateClienteDto);
	}

	@Delete(':id')
	remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
		return this.clientesService.remove(user.id, id);
	}
}
