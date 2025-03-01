import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({
    type: String,
    example: 'I love this product',
    description: 'Comment to be added to a product',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
}
