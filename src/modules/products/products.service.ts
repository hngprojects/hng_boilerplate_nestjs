import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, StatusType } from './entities/product.entity';
import { Repository } from 'typeorm';
import UserService from '../user/user.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private readonly userService: UserService
  ) {}

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

  async changeProductStatus(productId: string, userId: string, newStatus: StatusType) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
      relations: ['category'],
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
