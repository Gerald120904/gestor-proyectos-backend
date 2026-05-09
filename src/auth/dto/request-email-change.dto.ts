import { IsEmail } from 'class-validator';

export class RequestEmailChangeDto {
  @IsEmail({}, { message: 'Ingrese un correo electrónico válido.' })
  newEmail: string;
}