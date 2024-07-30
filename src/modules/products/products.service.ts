// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Product } from './entities/product.entity';
// import { ProductCategory } from '../product-category/entities/product-category.entity';
// import { CreateProductDto } from './dto/create-product.dto';

// @Injectable()
// export class ProductsService {
//   constructor(
//     @InjectRepository(Product)
//     private productRepository: Repository<Product>,

//     @InjectRepository(ProductCategory)
//     private categoryRepository: Repository<ProductCategory>
//   ) {}

//   async create(createProductDto: CreateProductDto): Promise<Product> {
//     const category = await this.categoryRepository.findOneBy({ id: createProductDto.categoryId });
//     if (!category) {
//       throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found`);
//     }
//     const product = this.productRepository.create({
//       ...createProductDto,
//       category,
//     });
//     return await this.productRepository.save(product);
//   }
// }
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { Product, ProductStatusType } from './entities/product.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { ProductCategory } from '../product-category/entities/product-category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Product) private organisationRepository: Repository<Organisation>,
    @InjectRepository(ProductCategory) private categoryRepository: Repository<ProductCategory>
  ) {}

  async createProduct(orgId: string, dto: CreateProductRequestDto) {
    const { name, quantity, price, categoryId } = dto;
    const org = await this.organisationRepository.findOne({ where: { id: orgId } });
    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    const newProduct: Product = await this.productRepository.create({
      name,
      quantity,
      price,
      org,
      category,
    });
    if (!newProduct)
      throw new InternalServerErrorException({
        status_code: 500,
        status: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      });
    await this.productRepository.save(newProduct);

    const status = await this.calculateProductStatus(quantity);
    return {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        status,
        quantity,
        created_at: newProduct.created_at,
        updated_at: newProduct.updated_at,
        category,
      },
    };
  }

  async calculateProductStatus(quantity: number): Promise<ProductStatusType> {
    if (quantity === 0) return ProductStatusType.OUT_STOCK;
    return quantity >= 5 ? ProductStatusType.IN_STOCK : ProductStatusType.LOW_STOCK;
  }
}
