import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

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
    description: 'The quantity of the product',
    minimum: 0,
    example: 10,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'The price of the product',
    minimum: 0,
    example: 99.99,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'ID of the category to which the product belongs',
    example: 'uuid-of-category',
  })
  @IsString()
  @IsOptional()
  categoryId: string;
}
