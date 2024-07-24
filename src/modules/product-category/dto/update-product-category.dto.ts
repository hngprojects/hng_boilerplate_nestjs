import { PartialType } from '@nestjs/mapped-types';
import { CreateProductCategoryDto } from './create-product-category.dto';

export class UpdateProductCategoryDto extends PartialType(CreateProductCategoryDto) {}
