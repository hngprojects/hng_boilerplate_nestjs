import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'The category of the FAQ', example: 'Policies' })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @ApiPropertyOptional({
    description: 'Tags related to the FAQ',
    example: ['return', 'policy', 'purchase'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @ArrayNotEmpty({ message: 'Tags array cannot be empty' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}
