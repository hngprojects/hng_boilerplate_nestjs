import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBlogCategoryDto {
  @ApiProperty({ example: 'Technology' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
