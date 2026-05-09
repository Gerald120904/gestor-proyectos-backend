import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('general')
  getGeneralReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getGeneralReport(query);
  }

  @Get('summary')
  getSummary(@Query() query: ReportQueryDto) {
    return this.reportsService.getGeneralReport(query);
  }
}
