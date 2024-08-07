import { IsOptional, IsArray, IsString, IsDateString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlogDto {
  @ApiProperty({ description: 'The title of the blog', required: false })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title?: string

  @ApiProperty({ description: 'The content of the blog', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'The publish date of the blog', required: false })
  @IsOptional()
  @IsDateString()
  publish_date?: string;

  @ApiProperty({ description: 'The author of the blog', required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: 'The tags associated with the blog', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'The image URLs associated with the blog', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_urls?: string[];
}
