import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RequestPhoneChangeDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(/^[0-9+\s-]+$/, {
    message: 'El teléfono solo puede contener números, espacios, guiones o el símbolo +.',
  })
  newPhone!: string;
}