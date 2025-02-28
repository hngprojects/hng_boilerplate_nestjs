import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The id of the product being commented on' })
  @IsString()
  @IsNotEmpty()
  product_id: string; // Fix: Allow specifying the product

  @ApiProperty({ description: 'The id of the user making the comment' })
  @IsString()
  @IsNotEmpty()
  user_id: string; // Fix: Allow specifying the user

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
