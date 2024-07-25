import { IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My First Blog',
    description: 'The title of the blog',
    type: String,
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'The URL of the blog image',
    type: String,
    required: true,
  })
  image_url: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'This is the content of the blog',
    description: 'The content of the blog',
    type: String,
    required: true,
  })
  content: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'authorId123',
    description: 'The ID of the author',
    type: String,
    required: true,
  })
  authorId: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Publish status of the blog',
    type: Boolean,
    required: false,
  })
  isPublished?: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'categoryId456',
    description: 'The ID of the category',
    type: String,
    required: true,
  })
  categoryId: string;
}
