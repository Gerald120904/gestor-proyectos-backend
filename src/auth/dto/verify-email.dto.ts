import { IsEmail, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Ingrese un correo válido.' })
  email: string;

  @Matches(/^\d{6}$/, {
    message: 'El código debe tener 6 dígitos.',
  })
  code: string;
}
