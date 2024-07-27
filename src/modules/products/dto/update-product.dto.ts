import { IsString, IsInt, Min, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Updated Product Name',
    required: false,
  })
  @IsOptional()
  @IsString()
  product_name?: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'This is an updated description of the product.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiProperty({
    description: 'Price of the product',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'ID of the category to which the product belongs',
    example: 'uuid-of-new-category',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
