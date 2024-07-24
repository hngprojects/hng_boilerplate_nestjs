import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto extends PartialType(CreateBlogDto) {
  @IsString()
  @IsNotEmpty()
  readonly content: string;
}
