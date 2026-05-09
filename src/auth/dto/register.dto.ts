import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
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

  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  @MaxLength(120, {
    message: 'El correo no puede superar los 120 caracteres.',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString({ message: 'La contraseña debe ser texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @Length(6, 30, {
    message: 'La contraseña debe tener entre 6 y 30 caracteres.',
  })
  password: string;

  @IsString({ message: 'El teléfono debe ser texto.' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message:
      'El teléfono debe estar en formato internacional. Ejemplo: +50688888888.',
  })
  @Transform(({ value }) => value?.replace(/\s+/g, '').trim())
  telefono: string;

  @IsString({ message: 'El código del país debe ser texto.' })
  @IsNotEmpty({ message: 'El código del país es obligatorio.' })
  @Length(2, 2, {
    message: 'El código del país debe tener 2 letras. Ejemplo: CR.',
  })
  @Matches(/^[A-Z]{2}$/, {
    message: 'El código del país debe tener formato ISO. Ejemplo: CR.',
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  phoneCountryIso2: string;

  @IsString({ message: 'El código telefónico debe ser texto.' })
  @IsNotEmpty({ message: 'El código telefónico es obligatorio.' })
  @Matches(/^\+\d{1,4}$/, {
    message: 'El código telefónico debe tener formato válido. Ejemplo: +506.',
  })
  @Transform(({ value }) => value?.trim())
  phoneDialCode: string;

  @IsOptional()
  @IsString({ message: 'El token FCM debe ser texto.' })
  @Transform(({ value }) => value?.trim())
  fcmToken?: string;

  @IsOptional()
  @IsString({ message: 'La plataforma debe ser texto.' })
  @Transform(({ value }) => value?.trim())
  platform?: string;
}