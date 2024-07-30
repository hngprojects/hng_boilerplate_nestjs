import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OtpDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
