import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class ProductDetailsDto {
  @ApiProperty({
    description: 'Product id',
    example: 'product_1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Product 1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Product description 1',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: '500',
  })
  price: number;

  @ApiProperty({
    description: 'Product status',
    example: 'Product status',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Product deletion status',
    example: 'false',
  })
  @IsBoolean()
  is_deleted: boolean;

  @ApiProperty({
    description: 'Product quantity',
    example: 'Product quantity',
  })
  quantity: number;

  @ApiProperty({
    description: 'Date when the product was created',
    example: new Date(),
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date when the product was last updated',
    example: new Date(),
  })
  updated_at: Date;
}
