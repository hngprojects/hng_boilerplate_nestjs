import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async search(query: string, page: number = 1, limit: number = 10): Promise<{ results: Product[], total: number }> {
    const [results, total] = await this.productRepository
      .createQueryBuilder('product')
      .where(`to_tsvector('english', product.name || ' ' || product.description || ' ' || product.category || ' ' || array_to_string(product.tags, ' ')) @@ plainto_tsquery('english', :query)`, { query })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { results, total };
  }
}   