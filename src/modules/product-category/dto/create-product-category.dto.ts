import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class CreateProductCategoryDto {
  @ApiProperty({
    description: 'Name of the product category',
    example: 'Electronics',
  })
  @IsNotEmpty()
  @IsString()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({
    description: 'Description of the product category',
    example: 'Electronic devices and accessories',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @Column({ type: 'text', nullable: false })
  description: string;

  @ApiProperty({
    description: 'Slug for the product category',
    example: 'electronics',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @Column({ type: 'text', nullable: false })
  slug: string;

  @ApiProperty({
    description: 'Parent ID of the category, if any',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true })
  parentId?: string;
}
