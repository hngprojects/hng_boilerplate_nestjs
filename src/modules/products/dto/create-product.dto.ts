import { IsNotEmpty, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'New Product',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'This is a detailed description of the product.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Current stock of the product',
    example: 10,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  avail_qty: number;

  @ApiProperty({
    description: 'In stock of the product',
    example: 10,
  })
  @ApiProperty({
    description: 'Price of the product',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Product categories',
    example: 'motor',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'User id',
    example: '',
  })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}