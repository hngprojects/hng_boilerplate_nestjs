import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogCategoryDto {
  @ApiProperty({ example: 'Technology' })
  @IsNotEmpty({ message: 'Category name must not be empty.' })
  @IsString({ message: 'Category name must be a string.' })
  name: string;
}
