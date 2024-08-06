import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The id of the blog being commented on' })
  @IsNotEmpty()
  blog_id: string;

  @ApiProperty({ description: 'The user writing the comment' })
  @IsNotEmpty()
  author: string;

  @ApiProperty({ description: 'The content of the comment' })
  @IsNotEmpty()
  content: string;
}
