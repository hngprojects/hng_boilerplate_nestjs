import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, MaxLength, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ProductStatusType } from '../entities/product.entity';
import { Type } from 'class-transformer';
import { ProductVariantDto } from './product-variant.dto';

export class UpdateProductDTO {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Binatone Fan',
  })
  @IsNotEmpty()
  @IsString()
  name?: string;

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
    description: 'Image URL',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatusType,
  })
  @IsEnum(ProductStatusType, { each: true })
  status?: ProductStatusType;

  @ApiProperty({
    description: 'Product variants',
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
