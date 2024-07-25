import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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

  async create(createCategoryDto: CreateProductCategoryDto): Promise<ProductCategory> {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw error({ error: error.message });
    }
  }

  async findAll(limit?: number, offset?: number): Promise<ProductCategory[]> {
    try {
      if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 0)) {
        throw new BadRequestException('Limit must be a non-negative number');
      }
      if (offset !== undefined && (isNaN(Number(offset)) || Number(offset) < 0)) {
        throw new BadRequestException('Offset must be a non-negative number');
      }

      const options: any = {};
      if (limit !== undefined) {
        options.take = Number(limit);
      }

      if (offset !== undefined) {
        options.skip = Number(offset);
      }
      return this.categoryRepository.find(options);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
    }
  }

  async findOne(id: string): Promise<ProductCategory> {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateProductCategoryDto): Promise<ProductCategory> {
    try {
      const category = await this.findOne(id);
      Object.assign(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }

  async removeCategory(id: string): Promise<void> {
    try {
      const category = await this.findOne(id);
      await this.categoryRepository.remove(category);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }
}
