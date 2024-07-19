import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateWaitlistUserDto {
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsNotEmpty({ message: 'FullName field cannot be empty' })
  @IsString()
  fullName: string;
}
