import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateWaitlistUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  to: string;

  @IsNotEmpty({ message: 'FullName field cannot be empty' })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: 'subject field cannot be empty' })
  @IsString()
  subject: string;

  @IsNotEmpty({ message: 'subject field cannot be empty' })
  @IsString()
  template: string;

  @IsNotEmpty()
  @IsObject()
  context: object;
}
