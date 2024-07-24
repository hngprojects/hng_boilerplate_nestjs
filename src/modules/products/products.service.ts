import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from '../product-category/entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Fetch the category by ID
    const category = await this.categoryRepository.findOneBy({ id: createProductDto.categoryId });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found`);
    }

    // Create and save the product
    const product = this.productRepository.create({
      ...createProductDto,
      category, // Set the category as a single object
    });

    return await this.productRepository.save(product);
  }
}