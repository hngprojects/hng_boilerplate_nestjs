import { ApiProperty } from '@nestjs/swagger';
import { BlogResponseDto } from './blog-response.dto';

export class UpdateBlogResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Updated blog details', type: BlogResponseDto })
  post: BlogResponseDto;
}
