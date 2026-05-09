import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Ingrese un correo válido.' })
  email: string;
}
