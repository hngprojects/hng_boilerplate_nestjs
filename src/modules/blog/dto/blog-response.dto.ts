import { ApiProperty } from '@nestjs/swagger';
import { Blog } from '../entities/blog.entity';

export class ResponseDto {
  @ApiProperty({ example: 'success', description: 'The status of the response' })
  status: string;

  @ApiProperty({ example: 'Blog created successfully', description: 'The message of the response' })
  message: string;

  @ApiProperty({ example: 201, description: 'The HTTP status code of the response' })
  status_code: number;

  @ApiProperty({ type: Blog, description: 'The data of the response', required: false })
  data?: Blog;
}
