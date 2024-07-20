import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../dist/product.entity';

@Injectable()
export class ProductSearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async searchProducts(name?: string, category?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (name) {
      query.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (category) {
      query.andWhere('product.category = :category', { category });
    }

    if (minPrice) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    return await query.getMany();
  }
}
