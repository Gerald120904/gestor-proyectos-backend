import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get()
	getResumen(@CurrentUser() user: any) {
		return this.dashboardService.getResumen(user.id);
	}
}
