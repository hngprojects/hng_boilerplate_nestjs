import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { ProductSizeType } from '../entities/product-variant.entity';

export class ProductVariantDto {
  @ApiProperty({
    description: 'The size of the product',
    enum: ProductSizeType,
  })
  @IsEnum(ProductSizeType, { each: true })
  size?: ProductSizeType;

  @ApiProperty({
    description: 'The quantity of product',
    example: 10,
  })
  @IsInt()
  quantity?: number;

  @ApiProperty({
    description: 'The price of the product',
    example: 500,
  })
  @IsInt()
  price?: number;
}
