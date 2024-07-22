import { HttpStatus, Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async fetchSingleProduct(productId: string) {
    this.logger.log(`Attempting to retrieve product with id: ${productId}`);
    try {
      const productExists = await this.repo.findOneBy({ id: productId });
      if (!productExists) {
        this.logger.error(`Product with id: ${productId} does not exist`);
        throw new NotFoundException('Product not found');
      }

      return {
        status: 'success',
        message: 'Product fetched successfully',
        data: {
          id: productExists.id,
          name: productExists.product_name,
          description: productExists.description,
          price: productExists.product_price,
          //   category: productExists.'',
          //   available: '',
          //   created_at: '',
          //   updated_at: '',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve product with id : ${productId}`, error.stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
