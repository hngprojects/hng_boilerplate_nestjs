import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

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
  categoryId?: number;

  @IsNotEmpty()
  @IsString()
  authorId: string;
}
