import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>
  ) {}

  async createCategory(createCategoryDto: CreateProductCategoryDto): Promise<ProductCategory> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async getAllCategories(limit?: number, offset?: number): Promise<ProductCategory[]> {
    if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 0)) {
      throw new BadRequestException('Limit must be a non-negative number');
    }
    if (offset !== undefined && (isNaN(Number(offset)) || Number(offset) < 0)) {
      throw new BadRequestException('Offset must be a non-negative number');
    }
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (limit !== undefined) {
      queryBuilder.take(limit);
    }

    if (offset !== undefined) {
      queryBuilder.skip(offset);
    }
    return queryBuilder.getMany();
  }

  async getCategoryById(id: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateProductCategoryDto): Promise<ProductCategory> {
    const category = await this.getCategoryById(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);
    await this.categoryRepository.remove(category);
  }
}
