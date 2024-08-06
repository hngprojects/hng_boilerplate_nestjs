import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, StockStatusType } from './entities/product.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { ProductVariant } from './entities/product-variant.entity';
import { last } from 'rxjs';

interface SearchCriteria {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>
  ) {}

  async createProduct(id: string, dto: CreateProductRequestDto) {
    const org = await this.organisationRepository.findOne({ where: { id } });
    if (!org)
      throw new InternalServerErrorException({
        status: 'Unprocessable entity exception',
        message: 'Invalid organisation credentials',
        status_code: 422,
      });
    const newProduct: Product = this.productRepository.create(dto);
    newProduct.org = org;
    const statusCal = await this.calculateProductStatus(dto.quantity);
    newProduct.stock_status = statusCal;
    const product = await this.productRepository.save(newProduct);
    if (!product || !newProduct)
      throw new InternalServerErrorException({
        status_code: 500,
        status: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      });

    return {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        status: product.stock_status,
        is_deleted: product.is_deleted,
        quantity: product.quantity,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    };
  }

  async searchProducts(orgId: string, criteria: SearchCriteria) {
    console.log(orgId, 'orgId');
    const org = await this.organisationRepository.findOne({ where: { id: orgId } });
    console.log(org, 'org');
    if (!org)
      throw new InternalServerErrorException({
        status: 'Unprocessable entity exception',
        message: 'Invalid organisation credentials',
        status_code: 422,
      });

    const { name, category, minPrice, maxPrice } = criteria;
    const query = this.productRepository.createQueryBuilder('product').where('product.orgId = :orgId', { orgId });

    if (name) {
      query.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    if (minPrice) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const products = await query.getMany();

    if (!products.length) {
      throw new NotFoundException({
        status: 'No Content',
        status_code: 204,
        message: 'No products found',
      });
    }

    return {
      success: true,
      statusCode: 200,
      products,
    };
  }

  async calculateProductStatus(quantity: number): Promise<StockStatusType> {
    if (quantity === 0) return StockStatusType.OUT_STOCK;
    return quantity >= 5 ? StockStatusType.IN_STOCK : StockStatusType.LOW_STOCK;
  }

  async updateProduct(id: string, productId: string, updateProductDto: UpdateProductDTO) {
    const org = await this.organisationRepository.findOne({ where: { id } });
    if (!org)
      throw new InternalServerErrorException({
        status: 'Unprocessable entity exception',
        message: 'Invalid organisation credentials',
        status_code: 422,
      });
    const product = await this.productRepository.findOne({ where: { id: productId }, relations: ['org'] });
    if (!product) {
      throw new NotFoundException({
        error: 'Product not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }
    if (product.org.id !== org.id) {
      throw new ForbiddenException({
        status: 'fail',
        message: 'Not allowed to perform this action',
      });
    }

    try {
      await this.productRepository.update(productId, {
        ...updateProductDto,
        stock_status: await this.calculateProductStatus(updateProductDto.quantity),
      });

      const updatedProduct = await this.productRepository.findOne({ where: { id: productId } });
      return {
        status_code: HttpStatus.OK,
        message: 'Product updated successfully',
        data: updatedProduct,
      };
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException(`Internal error occurred: ${error.message}`);
    }
  }

  async getProductById(productId: string) {
    try {
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }
      return {
        message: 'Product retrieved successfully',
        data: product,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal error occurred: ${error.message}`);
    }
  }

  async deleteProduct(orgId: string, productId: string) {
    const org = await this.organisationRepository.findOne({ where: { id: orgId } });
    if (!org) {
      throw new InternalServerErrorException({
        status: 'Unprocessable entity exception',
        message: 'Invalid organisation credentials',
        status_code: 422,
      });
    }

    try {
      const product = await this.productRepository.findOne({ where: { id: productId }, relations: ['org'] });
      if (product.org.id !== org.id) {
        throw new ForbiddenException({
          status: 'fail',
          message: 'Not allowed to perform this action',
        });
      }
      product.is_deleted = true;
      await this.productRepository.save(product);
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException(`Internal error occurred: ${error.message}`);
    }

    return {
      message: 'Product successfully deleted',
      data: {},
    };
  }

  async getProductStock(productId: string) {
    try {
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException(`Product not found`);
      }
      return {
        message: 'Product stock retrieved successfully',
        data: {
          product_id: product.id,
          current_stock: product.quantity,
          last_updated: product.updated_at,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Internal error occurred: ${error.message}`);
    }
  }
}
