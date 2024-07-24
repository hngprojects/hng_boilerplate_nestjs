import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) {}

  async fetchSingleProduct(productId: string) {
    this.logger.log(`Attempting to retrieve product with id: ${productId}`);

    try {
      const productExists = await this.productRepository.findOneBy({ id: productId });
      if (!productExists) {
        this.logger.log(`Product with id: ${productId} does not exist`);
        return {
          error: 'Product not found',
          status_code: HttpStatus.NOT_FOUND,
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Product fetched successfully',
        data: productExists,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          error: 'Product not found',
          status_code: HttpStatus.NOT_FOUND,
        };
      }
      this.logger.error(`Failed to retrieve product with id: ${productId}`, error.stack);
      throw new InternalServerErrorException('Unexpected error occurred while fetching product');
    }
  }
}
