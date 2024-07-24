import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { string } from 'joi';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: string) {
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
  }
}
