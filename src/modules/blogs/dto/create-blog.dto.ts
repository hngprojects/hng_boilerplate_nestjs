import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUrl, MinLength, IsNotEmpty, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    description: 'The title of the blog',
    example: 'How to learn NestJS',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    description: 'The content of the blog',
    example: 'This is the content of the blog...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The image URLs related to the blog',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  image_urls: string[];

  @ApiProperty({
    description: 'The tags associated with the blog',
    example: ['NestJS', 'TypeScript'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'The author of the blog',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  author: string;
}
