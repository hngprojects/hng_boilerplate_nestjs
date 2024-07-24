import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) {}

  async fetchSingleProduct(productId: String) {
    const productExists = await this.productRepository.findOneBy({ id: productId });
    if (!productExists) {
      return {
        error: 'Product not found',
        status_code: HttpStatus.NOT_FOUND,
      };
    }
    return {
      status_code: HttpStatus.CREATED,
      message: 'Product fetched successfully',
      data: productExists,
    };
  }
}
