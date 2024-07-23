import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email address' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
