import { Type, Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateProyectoDto {
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio.' })
  @Length(3, 100, {
    message: 'El nombre debe tener entre 3 y 100 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsString({ message: 'La descripción debe ser texto.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @Length(5, 500, {
    message: 'La descripción debe tener entre 5 y 500 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  descripcion: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El monto total debe ser un número.' })
  @Min(1, { message: 'El monto total debe ser mayor a 0.' })
  @Max(100000000, {
    message: 'El monto total no puede superar 100,000,000.',
  })
  montoTotal: number;

  @IsOptional()
  @IsIn(['PENDIENTE', 'ACTIVO', 'FINALIZADO', 'PAUSADO'], {
    message: 'El estado debe ser PENDIENTE, ACTIVO, FINALIZADO o PAUSADO.',
  })
  estado?: 'PENDIENTE' | 'ACTIVO' | 'FINALIZADO' | 'PAUSADO';

  @Type(() => Number)
  @IsInt({ message: 'El clienteId debe ser un número entero.' })
  @Min(1, { message: 'El clienteId debe ser mayor a 0.' })
  clienteId: number;
}
