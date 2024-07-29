import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, MaxLength } from 'class-validator';

export class UpdateProductDTO {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Binatone Fan',
  })
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @ApiProperty({
    description: 'The product description',
    example: 'The binatone fan is very efficient',
  })
  @IsString()
  @MaxLength(72, {
    message: 'Description cannot be more than 72 characters',
  })
  description?: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 'NGN 10000',
  })
  @IsInt()
  price?: number;
}
