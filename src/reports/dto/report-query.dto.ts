import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsIn(['today', 'week', 'month', 'year', 'custom'])
  period?: 'today' | 'week' | 'month' | 'year' | 'custom';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
