import { IsString } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}
