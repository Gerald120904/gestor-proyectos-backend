import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateVisitaDto {
  @IsDateString({}, { message: 'La fecha debe tener un formato válido.' })
  fecha: string;

  @IsString({ message: 'La hora debe ser texto.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe tener formato HH:mm, por ejemplo 09:30.',
  })
  hora: string;

  @IsString({ message: 'La dirección debe ser texto.' })
  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  @Length(5, 150, {
    message: 'La dirección debe tener entre 5 y 150 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  direccion: string;

  @IsOptional()
  @IsIn(['PROGRAMADA', 'REALIZADA', 'CANCELADA'], {
    message: 'El estado debe ser PROGRAMADA, REALIZADA o CANCELADA.',
  })
  estado?: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA';

  @IsOptional()
  @IsString({ message: 'La observación debe ser texto.' })
  @Length(3, 250, {
    message: 'La observación debe tener entre 3 y 250 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  observacion?: string;
}
