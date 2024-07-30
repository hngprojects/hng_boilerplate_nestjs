import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { Product, StockStatusType, StatusType } from './entities/product.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import UserService from '../user/user.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>,
    private readonly userService: UserService
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
    newProduct.stock_status = statusCal;
    await this.productRepository.save(newProduct);
    return {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        status: newProduct.stock_status,
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
