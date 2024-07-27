import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductCategoryDto {
  @ApiProperty({
    description: 'Name of the product category',
    example: 'Electronics',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the product category',
    example: 'Electronic devices and accessories',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Slug for the product category',
    example: 'electronics',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Parent ID of the category, if any',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
