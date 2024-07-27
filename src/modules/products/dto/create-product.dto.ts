import { IsNotEmpty, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'New Product',
  })
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'This is a detailed description of the product.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 10,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Price of the product',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'ID of the category to which the product belongs',
    example: 'uuid-of-category',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
