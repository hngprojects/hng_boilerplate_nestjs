import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductSearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async searchProducts(name?: string, description?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (name) {
      query.andWhere('product.product_name LIKE :name', { name: `%${name}%` });
    }

    if (description) {
      query.andWhere('product.description LIKE :description', { description: `%${description}%` });
    }

    if (minPrice) {
      query.andWhere('product.product_price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('product.product_price <= :maxPrice', { maxPrice });
    }

    return await query.getMany();
  }
}
