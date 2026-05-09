import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class LoginDto {
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
}
