import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateComentarioDto {
  @IsString({ message: 'El título debe ser texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @Length(3, 100, {
    message: 'El título debe tener entre 3 y 100 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  titulo: string;

  @IsString({ message: 'El contenido debe ser texto.' })
  @IsNotEmpty({ message: 'El contenido es obligatorio.' })
  @Length(5, 500, {
    message: 'El contenido debe tener entre 5 y 500 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  contenido: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener un formato válido.' })
  fecha?: string;
}
