import { IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  tags: string;
}
