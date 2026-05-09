import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ConfirmPhoneChangeDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 10)
  @Matches(/^\d+$/, {
    message: 'El código solo debe contener números.',
  })
  code!: string;
}