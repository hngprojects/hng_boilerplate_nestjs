import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
