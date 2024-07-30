import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  model_id?: string;

  @IsOptional()
  @IsString()
  model_type?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}
