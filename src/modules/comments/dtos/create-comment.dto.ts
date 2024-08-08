import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  model_id: string;

  @IsString()
  @IsNotEmpty()
  model_type: string;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
