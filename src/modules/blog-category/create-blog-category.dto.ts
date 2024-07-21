import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
