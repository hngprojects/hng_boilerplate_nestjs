import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestSigninTokenDto {
  @ApiProperty({
    description: 'The email address of the user requesting a sign-in token',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
