import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Email must be an email' })
  email: string;

  @IsOptional()
  @IsInt()
  phone: number;

  @IsNotEmpty({ message: 'Message should not be empty' })
  @IsString({ message: 'Message should not be a string' })
  message: string;
}
