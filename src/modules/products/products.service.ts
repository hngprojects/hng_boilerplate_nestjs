import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProductDTO } from './dto/update-product.dto';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { Product, ProductStatusType } from './entities/product.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Injectable()
export class ProductsService {
  constructor(
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
    newProduct.status = statusCal;
    await this.productRepository.save(newProduct);
    return {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        status: newProduct.status,
        quantity,
        created_at: newProduct.created_at,
        updated_at: newProduct.updated_at,
      },
    };
  }

  async updateProduct(productId: string, updateProductDto: UpdateProductDTO) {
    const productExist = await this.productRepository.findOne({ where: { id: productId } });

    if (!productExist) {
      throw new NotFoundException({
        error: 'Product not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }

    await this.productRepository.update(productId, updateProductDto);
    const product = await this.productRepository.findOne({ where: { id: productId } });

    const calculateProductStatus = await this.calculateProductStatus((await product).quantity);

    product.status = calculateProductStatus;

    await this.productRepository.save(product);

    return {
      status_code: HttpStatus.OK,
      message: 'Product updated successfully',
      data: product,
    };
  }

  async calculateProductStatus(quantity: number): Promise<ProductStatusType> {
    if (quantity === 0) return ProductStatusType.OUT_STOCK;
    return quantity >= 5 ? ProductStatusType.IN_STOCK : ProductStatusType.LOW_STOCK;
  }

  async getProductStock(productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException({
        error: 'Product not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }

    return {
      status_code: HttpStatus.OK,
      message: 'Product stock retrieved successfully',
      data: {
        product_id: productId,
        current_stock: product.quantity,
        last_updated: product.updated_at,
      },
    };
  }
}
