import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async searchProducts(query: string, page: number = 1, limit: number = 10): Promise<{ total: number; results: Product[] }> {
    const skip = (page - 1) * limit;

    const [results, total] = await this.productsRepository
      .createQueryBuilder('product')
      .where("to_tsvector('english', product.name) @@ plainto_tsquery('english', :query) OR to_tsvector('english', product.description) @@ plainto_tsquery('english', :query) OR to_tsvector('english', product.category) @@ plainto_tsquery('english', :query) OR to_tsvector('english', array_to_string(product.tags, ' ')) @@ plainto_tsquery('english', :query)", { query })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { total, results };
  }
}