import { Type, Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreatePagoDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser un número.' })
  @Min(1, { message: 'El monto debe ser mayor a 0.' })
  @Max(100000000, {
    message: 'El monto no puede superar 100,000,000.',
  })
  monto: number;

  @IsDateString({}, { message: 'La fecha debe tener un formato válido.' })
  fecha: string;

  @IsIn(['EFECTIVO', 'TRANSFERENCIA', 'SINPE_MOVIL', 'TARJETA', 'OTRO'], {
    message:
      'El método debe ser EFECTIVO, TRANSFERENCIA, SINPE_MOVIL, TARJETA u OTRO.',
  })
  metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'SINPE_MOVIL' | 'TARJETA' | 'OTRO';

  @IsOptional()
  @IsString({ message: 'La observación debe ser texto.' })
  @Length(3, 250, {
    message: 'La observación debe tener entre 3 y 250 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  observacion?: string;
}
