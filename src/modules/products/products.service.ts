import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>) {}

  async fetchSingleProduct(productId: string) {
    const productExists = await this.productRepository.findOne({
      where: {
        id: productId,
      },
      relations: ['category'],
    });
    if (!productExists) {
      throw new NotFoundException({
        error: 'Product not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }
    return {
      status_code: HttpStatus.OK,
      message: 'Product fetched successfully',
      data: {
        products: {
          id: productExists.id,
          product_name: productExists.product_name,
          description: productExists.description,
          quantity: productExists.quantity,
          price: productExists.price,
          category: productExists.category.id,
          created_at: productExists.created_at,
          updated_at: productExists.updated_at,
        },
      },
    };
  }
}
