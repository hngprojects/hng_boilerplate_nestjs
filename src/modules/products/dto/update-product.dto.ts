import { PartialType } from '@nestjs/mapped-types';
import { CreateProductRequestDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductRequestDto) {}
