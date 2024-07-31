import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddToWaitlistRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
