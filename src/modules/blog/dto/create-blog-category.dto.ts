import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogCategoryDto {
  @ApiProperty({
    description: 'The name of the blog category',
    example: 'Technology',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
