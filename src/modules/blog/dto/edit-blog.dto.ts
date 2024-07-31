import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';

export class EditBlogPost {
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
