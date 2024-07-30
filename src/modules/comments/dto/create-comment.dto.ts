import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  model_id: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['post', 'blog', 'content'])
  model_type: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
