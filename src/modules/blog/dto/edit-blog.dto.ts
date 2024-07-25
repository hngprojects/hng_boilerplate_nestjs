import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';

export class EditBlogDto {
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
  categoryId?: string;

  @IsNotEmpty()
  @IsString()
  authorId: string;
}
