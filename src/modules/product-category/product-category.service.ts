import { Injectable, InternalServerErrorException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>
  ) {}

  async createProductCategory(CreateProductCategoryDto: CreateProductCategoryDto): Promise<ProductCategory> {
   try {
    const category = this.categoryRepository.create(CreateProductCategoryDto);
    return await this.categoryRepository.save(category);
   } catch (error) {
    throw new InternalServerErrorException({
      message: "Internal server error",
      status_code: 500
    })
   }
  }

}