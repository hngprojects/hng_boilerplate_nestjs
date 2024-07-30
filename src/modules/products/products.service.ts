import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { Product, StockStatusType, StatusType } from './entities/product.entity';
import UserService from '../user/user.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private readonly userService: UserService
  ) {}

  async createProduct(orgId: string, dto: CreateProductRequestDto) {
    const { name, quantity, price } = dto;
    const newProduct: Product = await this.productRepository.create({
      name,
      quantity,
      price,
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

  async calculateProductStatus(quantity: number): Promise<StockStatusType> {
    if (quantity === 0) return StockStatusType.OUT_STOCK;
    return quantity >= 5 ? StockStatusType.IN_STOCK : StockStatusType.LOW_STOCK;
  }

  async changeProductStatus(productId: string, userId: string, newStatus: StatusType) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    const user = await this.userService.getUserRecord({ identifier: userId, identifierType: 'id' });

    if (!product) {
      throw new NotFoundException({
        error: 'not found',
        status_code: HttpStatus.NOT_FOUND,
        message: 'Product not found',
      });
    }

    if (user.user_type !== 'super-admin') {
      throw new ForbiddenException({
        error: 'Forbidden',
        status_code: HttpStatus.FORBIDDEN,
        message: 'Forbidden user',
      });
    }

    product.status = newStatus;

    await this.productRepository.save(product);

    return { message: 'Product status updated successfully', status_code: HttpStatus.OK, data: product };
  }
}
