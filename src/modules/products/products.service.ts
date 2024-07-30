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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>
  ) {}

  async createProduct(orgId: string, dto: CreateProductRequestDto) {
    const { name, quantity, price } = dto;
    const org = await this.organisationRepository.findOne({ where: { id: orgId } });

    const newProduct: Product = await this.productRepository.create({
      name,
      quantity,
      price,
      org,
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
      },
    };
  }

  async calculateProductStatus(quantity: number): Promise<ProductStatusType> {
    if (quantity === 0) return ProductStatusType.OUT_STOCK;
    return quantity >= 5 ? ProductStatusType.IN_STOCK : ProductStatusType.LOW_STOCK;
  }
}
