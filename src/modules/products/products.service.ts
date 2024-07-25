import { HttpStatus, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async remove(id: string) {
    try {
      const result = await this.productRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException({
          error: 'Product not found',
          message: `The product with ID ${id} does not exist`,
          status_code: HttpStatus.NOT_FOUND,
        });
      }

      return {
        message: 'Product deleted successfully.',
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the product',
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
