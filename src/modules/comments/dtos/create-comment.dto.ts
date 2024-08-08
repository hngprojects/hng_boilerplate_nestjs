import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The id of the model creating comment for' })
  @IsString()
  @IsNotEmpty()
  model_id: string;

  @ApiProperty({ description: 'The type of the model creating comment for' })
  @IsString()
  @IsNotEmpty()
  model_type: string;

  @ApiProperty({ description: 'The comment to be added' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
