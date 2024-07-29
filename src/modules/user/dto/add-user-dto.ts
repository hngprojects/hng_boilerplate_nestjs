import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AddUserDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone_number: string;
}
