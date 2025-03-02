import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?[0-9\-\s()]{8,20}$/, {
    message: 'Invalid phone number format',
  })
  phone: string;

  @IsNotEmpty({ message: 'Message should not be empty' })
  @IsString({ message: 'Message must be a string' })
  message: string;
}
