import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class updateHelp {
  @ApiProperty({ description: 'The title of the help center entry', example: 'How to reset your password' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({
    description: 'The content of the help center entry',
    example: 'To reset your password, go to the login page and click "Forgot Password".',
  })
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;

  @ApiProperty({ description: 'The author of the help center entry', example: 'John Doe' })
  @IsNotEmpty({ message: 'Author is required' })
  @IsString({ message: 'Author must be a string' })
  author: string;
}
