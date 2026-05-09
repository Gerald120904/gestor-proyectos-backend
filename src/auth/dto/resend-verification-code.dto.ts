import { IsEmail } from 'class-validator';

export class ResendVerificationCodeDto {
  @IsEmail({}, { message: 'Ingrese un correo válido.' })
  email: string;
}
