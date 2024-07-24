import { IsNotEmpty, IsOptional, IsBoolean, IsString, IsNumber } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  authorId: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
