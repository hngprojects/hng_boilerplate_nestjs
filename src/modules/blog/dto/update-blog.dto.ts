import { PartialType } from '@nestjs/swagger';
import { CreateBlogPost } from './create-blog.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto extends PartialType(CreateBlogPost) {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsString()
  category_Id?: string;

  @IsNotEmpty()
  @IsString()
  author: string;
}
