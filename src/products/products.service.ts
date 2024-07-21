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
      .where("product.fullTextSearch @@ plainto_tsquery('english', :query)", { query })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { total, results };
  }
}


// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Product } from './entities/product.entity';

// @Injectable()
// export class ProductsService {
//   constructor(
//     @InjectRepository(Product)
//     private productsRepository: Repository<Product>,
//   ) {}

//   async searchProducts(query: string, page: number = 1, limit: number = 10): Promise<{ total: number; results: Product[] }> {
//     const skip = (page - 1) * limit;

//     const [results, total] = await this.productsRepository
//     .createQueryBuilder('product')
//     .where("product.fullTextSearch @@ plainto_tsquery('english', :query)", { query })
//     .skip(skip)
//     .take(limit)
//     .getManyAndCount();

//     return { total, results };
//   }
// }




// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ProductsService {
//   constructor(
//     @InjectRepository(Product)
//     private productRepository: Repository<Product>,
//   ) {}

//   async search(query: string, page: number = 1, limit: number = 10): Promise<{ results: Product[], total: number }> {
//     const [results, total] = await this.productRepository
//       .createQueryBuilder('product')
//       .where(`to_tsvector('english', product.name || ' ' || product.description || ' ' || product.category || ' ' || array_to_string(product.tags, ' ')) @@ plainto_tsquery('english', :query)`, { query })
//       .skip((page - 1) * limit)
//       .take(limit)
//       .getManyAndCount();

//     return { results, total };
//   }
// }   