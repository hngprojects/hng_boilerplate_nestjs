import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestSigninTokenDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
