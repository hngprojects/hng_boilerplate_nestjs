import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateProductDTO {
  @ApiPropertyOptional({
    description: 'The name of the product',
    minLength: 3,
    example: 'Product Name',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    description: 'The quantity of the product',
    minimum: 0,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({
    description: 'The price of the product',
    minimum: 0,
    example: 99.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'The category of the product',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString()
  @IsOptional()
  category: string;
}
