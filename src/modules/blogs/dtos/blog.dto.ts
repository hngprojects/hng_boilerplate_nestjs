import { ApiProperty } from '@nestjs/swagger';

export class BlogDto {
  @ApiProperty({ description: 'The ID of the blog' })
  id: string;

  @ApiProperty({ description: 'The title of the blog' })
  title: string;

  @ApiProperty({ description: 'The content of the blog' })
  content: string;

  @ApiProperty({ description: 'The tags associated with the blog', required: false })
  tags?: string[];

  @ApiProperty({ description: 'The image URLs associated with the blog', required: false })
  image_urls?: string[];

  @ApiProperty({ description: 'The author of the blog' })
  author: string;

  @ApiProperty({ description: 'The creation date of the blog' })
  published_date: Date;
}
