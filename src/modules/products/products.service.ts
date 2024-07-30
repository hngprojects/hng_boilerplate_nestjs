import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResult } from './interface/PaginationInterface';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { Product, ProductStatusType } from './entities/product.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

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
      
  async createProduct(orgId: string, dto: CreateProductRequestDto) {
    
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>
  ) {}

  async createProduct(id: string, dto: CreateProductRequestDto) {
    const { name, quantity, price } = dto;
    const org = await this.organisationRepository.findOne({ where: { id } });
    if (!org)
      throw new InternalServerErrorException({
        status: 'Unprocessable entity exception',
        message: 'Invalid organisation credentials',
        status_code: 422,
      });
    const newProduct: Product = await this.productRepository.create({
      name,
      quantity,
      price,
    });
    newProduct.org = org;
    if (!newProduct)
      throw new InternalServerErrorException({
        status_code: 500,
        status: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      });
    const statusCal = await this.calculateProductStatus(quantity);
    newProduct.satus = statusCal;
    await this.productRepository.save(newProduct);
    return {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        status: newProduct.satus,
        quantity,
        created_at: newProduct.created_at,
        updated_at: newProduct.updated_at,
      },
    };
  }

  async calculateProductStatus(quantity: number): Promise<ProductStatusType> {
    if (quantity === 0) return ProductStatusType.OUT_STOCK;
    return quantity >= 5 ? ProductStatusType.IN_STOCK : ProductStatusType.LOW_STOCK;
  }
}

