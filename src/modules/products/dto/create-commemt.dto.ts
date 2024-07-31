import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
