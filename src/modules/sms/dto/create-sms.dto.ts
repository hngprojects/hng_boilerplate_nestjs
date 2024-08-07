import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class CreateSmsDto {
  //@IsPhoneNumber()
  @IsNotEmpty()
  phone_number: string;

  @IsNotEmpty()
  @Length(1, 50)
  message: string;
}
