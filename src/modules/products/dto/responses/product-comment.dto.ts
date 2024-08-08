import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

class CommentDto {
  @ApiProperty({
    description: 'Comment id',
    example: 'comment_1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Product id',
    example: 'product_1',
  })
  @IsString()
  product_id: string;

  @ApiProperty({
    description: 'User id',
    example: 'user_1',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: 'Created comment',
    example: '15',
  })
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'Date when the stock was last updated',
    example: new Date(),
  })
  created_at: Date;
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'The message of the response',
    example: 'Comment added successfully',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The product details',
  })
  data: CommentDto;
}
