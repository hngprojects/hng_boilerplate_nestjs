import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class JobApplicationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'John Doe',
  })
  applicant_name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'johndoe@example.com',
  })
  email: string;

  @IsNotEmpty()
  resume: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Software Engineer who has worked with Node.js, React, and Angular',
  })
  cover_letter: string;
}
