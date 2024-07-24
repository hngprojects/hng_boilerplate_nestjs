import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductCategoryDto {
  @ApiProperty({
    description: 'Name of the product category',
    example: 'Electronics',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the product category',
    example: 'Electronic devices and accessories',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Slug for the product category',
    example: 'electronics',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Parent ID of the category, if any',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
