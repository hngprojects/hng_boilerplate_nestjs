import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ProductSizeType } from '../entities/product.entity';

export class CreateProductRequestDto {
  @ApiProperty({
    description: 'The name of the product',
    minLength: 3,
    example: 'Product Name',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'The description of the product',
    minimum: 0,
    example: 10,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The size of the product',
    minimum: 0,
    example: 10,
  })
  @IsEnum(ProductSizeType)
  @IsString()
  @IsOptional()
  size?: string;

  @ApiProperty({
    description: 'The image of the product',
    minimum: 0,
    example: 10,
  })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({
    description: 'The quantity of the product',
    minimum: 0,
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty({
    description: 'The price of the product',
    minimum: 0,
    example: 99.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'The category of the product',
    example: 'Electronics',
  })
  @IsString()
  @IsOptional()
  category: string;
}
