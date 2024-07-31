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

export class UpdateFaqDto {
  @IsString()
  @IsOptional()
  question: string;

  @IsString()
  @IsOptional()
  answer: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  tags: string;
}
