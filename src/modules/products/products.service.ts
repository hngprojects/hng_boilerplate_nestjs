import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Internal server error',
        status_code: 500,
      });
    }

  }
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
          name: productExists.name,
          description: productExists.description,
          avail_qty: productExists.avail_qty,
          price: productExists.price,
          category: productExists.category.id,
          created_at: productExists.created_at,
          updated_at: productExists.updated_at,
        },
      },
    };
  }
}

