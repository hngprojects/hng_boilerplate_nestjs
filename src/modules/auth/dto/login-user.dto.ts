import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
