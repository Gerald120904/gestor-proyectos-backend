import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegistrarFcmTokenDto {
  @IsString()
  @MinLength(20)
  token!: string;

  @IsOptional()
  @IsString()
  @IsIn(['android', 'ios', 'web', 'windows', 'macos'])
  platform?: string;
}
