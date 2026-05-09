import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsInternationalPhone } from '../../common/validators/is-international-phone.validator';

export class CreateClienteDto {
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @Length(3, 80, {
    message: 'El nombre debe tener entre 3 y 80 caracteres.',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios.',
  })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsString({ message: 'El país del teléfono debe ser texto.' })
  @IsNotEmpty({ message: 'Debe seleccionar el país del teléfono.' })
  @Length(2, 2, {
    message: 'El país del teléfono debe tener 2 letras, por ejemplo CR, US o MX.',
  })
  @Matches(/^[A-Za-z]{2}$/, {
    message: 'El país del teléfono debe tener solo letras.',
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  telefonoPais: string;

  @IsString({ message: 'El teléfono debe ser texto.' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @Length(4, 20, {
    message: 'El teléfono debe tener entre 4 y 20 caracteres.',
  })
  @Matches(/^[0-9+\s()-]+$/, {
    message: 'El teléfono solo puede contener números, espacios, +, paréntesis o guiones.',
  })
  @IsInternationalPhone('telefonoPais', {
    message: 'El teléfono no es válido para el país seleccionado.',
  })
  @Transform(({ value }) => value?.trim())
  telefono: string;

  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  @MaxLength(120, {
    message: 'El correo no puede superar los 120 caracteres.',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  correo: string;

  @IsString({ message: 'La dirección debe ser texto.' })
  @IsNotEmpty({ message: 'La dirección es obligatoria.' })
  @Length(5, 150, {
    message: 'La dirección debe tener entre 5 y 150 caracteres.',
  })
  @Transform(({ value }) => value?.trim())
  direccion: string;
}
