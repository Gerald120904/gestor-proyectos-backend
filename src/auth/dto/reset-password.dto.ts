import { IsEmail, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Ingrese un correo válido.' })
  email: string;

  @Matches(/^\d{6}$/, {
    message: 'El código debe tener 6 dígitos.',
  })
  code: string;

  @MinLength(6, {
    message: 'La contraseña debe tener mínimo 6 caracteres.',
  })
  newPassword: string;
}
