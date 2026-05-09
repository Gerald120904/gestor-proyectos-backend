import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateRecordatorioDto {
  @IsString({ message: 'El título debe ser texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @Length(3, 100, {
    message: 'El título debe tener entre 3 y 100 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  titulo: string;

  @IsString({ message: 'La descripción debe ser texto.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @Length(5, 500, {
    message: 'La descripción debe tener entre 5 y 500 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  descripcion: string;

  @IsDateString({}, { message: 'La fecha debe tener un formato válido.' })
  fecha: string;

  @IsString({ message: 'La hora debe ser texto.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe tener formato HH:mm, por ejemplo 09:30.',
  })
  hora: string;

  @IsOptional()
  @IsIn(['ALTA', 'MEDIA', 'BAJA'], {
    message: 'La prioridad debe ser ALTA, MEDIA o BAJA.',
  })
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'El campo completado debe ser verdadero o falso.' })
  completado?: boolean;
}
