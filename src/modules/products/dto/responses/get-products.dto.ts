import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';
import { ProductDetailsDto } from './product-details.dto';

export class ProductResponseDto {
  @ApiProperty({
    description: 'The message of the response',
    example: 'Product retrieved successfully',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The product details',
  })
  data: ProductDetailsDto;
}
