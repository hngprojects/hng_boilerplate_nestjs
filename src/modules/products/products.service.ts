import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationResult } from './interface/PaginationInterface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async findAllProducts(page: number = 1, limit: number = 5): Promise<PaginationResult> {
    if (
      (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 0)) ||
      (page !== undefined && (isNaN(Number(page)) || Number(page) < 0))
    ) {
      throw new BadRequestException({
        status: 'bad request',
        message: 'Invalid query params passed',
        status_code: HttpStatus.BAD_REQUEST,
      });
    }
    try {
      const [products, totalCount] = await this.productRepository.findAndCount({
        take: limit,
        skip: limit * (page - 1),
      });

      const totalPages = Math.ceil(totalCount / limit);
      return {
        success: true,
        message: 'Product retrieved successfully',
        products,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
        },
        status_code: 200,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Internal server error',
        status_code: 500,
      });
    }
  }
}
