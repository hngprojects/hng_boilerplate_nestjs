import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ description: 'The question of the FAQ', example: 'What is the return policy?' })
  @IsNotEmpty({ message: 'Question is required' })
  @IsString({ message: 'Question must be a string' })
  question: string;

  @ApiProperty({
    description: 'The answer of the FAQ',
    example: 'Our return policy allows returns within 30 days of purchase.',
  })
  @IsNotEmpty({ message: 'Answer is required' })
  @IsString({ message: 'Answer must be a string' })
  answer: string;

  @ApiProperty({ description: 'The category of the FAQ', example: 'Policies' })
  @IsNotEmpty({ message: 'Category is required' })
  @IsString({ message: 'Category must be a string' })
  category: string;
}
