import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'The URL for the user profile picture',
    example: 'https://example.com/profile-pic.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profile_pic_url?: string;

  @ApiProperty({
    description:
      'The password for the user account.\
    It must contain at least one uppercase letter, one lowercase letter,\
    one number, and one special character.',
    example: 'P@ssw0rd!',
  })
  @MinLength(8)
  @IsNotEmpty()
  @IsStrongPassword(
    {},
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }
  )
  password: string;

  @ApiProperty({
    description: 'An optional admin secret for elevated permissions',
    example: 'admin123',
    required: false,
  })
  @IsOptional()
  @IsString()
  admin_secret?: string;
}
