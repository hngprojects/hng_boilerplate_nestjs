import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  tags: string;
}
