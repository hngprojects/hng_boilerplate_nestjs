import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { Repository } from 'typeorm';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { AddCommentDto } from '../comments/dto/add-comment.dto';
import { Comment } from '../comments/entities/comments.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { User } from '../user/entities/user.entity';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { ProductVariant } from './entities/product-variant.entity';
import { Product, ProductSizeType, StockStatusType } from './entities/product.entity';

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
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async createProduct(id: string, dto: CreateProductRequestDto) {
    const org = await this.organisationRepository.findOne({ where: { id } });
    if (!org)
      throw new InternalServerErrorException({
        status: 'Unprocessable entity exception',
        message: 'Invalid organisation credentials',
        status_code: 422,
      });
    const payload = {
      name: dto.name,
      quantity: dto.quantity,
      price: dto.price,
      category: dto.category,
      description: dto.description,
      image: dto.image_url,
      size: dto.size as ProductSizeType,
    };

    const newProduct: Product = this.productRepository.create(payload);
    newProduct.org = org;
    const statusCal = await this.calculateProductStatus(dto.quantity);
    newProduct.stock_status = statusCal;
    newProduct.cost_price = 0.2 * dto.price - dto.price;
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
        quantity: product.quantity,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    };
  }

  async getAllProducts({ page = 1, pageSize = 2 }: { page: number; pageSize: number }) {
    const skip = (page - 1) * pageSize;
    const allProucts = await this.productRepository.find({ skip, take: pageSize });
    const totalProducts = await this.productRepository.count();

    return {
      status_code: HttpStatus.OK,
      message: 'members retrieved successfully',
      data: {
        products: allProucts,
        total: totalProducts,
        page,
        pageSize,
      },
    };
  }

  async getSingleProduct(productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new CustomHttpException(SYS_MSG.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return { status_code: HttpStatus.OK, message: 'Product fetched successfully', data: product };
  }

  async searchProducts(orgId: string, criteria: SearchCriteria) {
    const org = await this.organisationRepository.findOne({ where: { id: orgId } });
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
        cost_price: 0.2 * updateProductDto.price - updateProductDto.price,
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
      throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const product = await this.productRepository.findOne({ where: { id: productId }, relations: ['org'] });
    if (!product) {
      throw new CustomHttpException(SYS_MSG.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.productRepository.softDelete(product.id);
    return {
      message: 'Product successfully deleted',
      data: {},
    };
  }

  async addCommentToProduct(productId: string, commentDto: AddCommentDto, userId: string) {
    const { comment } = commentDto;
    const product = await this.productRepository.findOne({ where: { id: productId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!product) {
      throw new CustomHttpException(SYS_MSG.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const productComment = this.commentRepository.create({ comment, product, user });

    const saveComment = await this.commentRepository.save(productComment);

    const responsePayload = {
      id: saveComment.id,
      product_id: product.id,
      comment: saveComment.comment,
      user_id: userId,
      created_at: saveComment.created_at,
    };

    return {
      message: SYS_MSG.COMMENT_CREATED,
      data: responsePayload,
    };
  }

  async getProductStock(productId: string) {
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
  }

  private getDateRange(date: Date) {
    const monthStarts = startOfMonth(new Date(date));
    const monthEnds = endOfMonth(new Date(date));

    return { monthStarts, monthEnds };
  }

  private async getTotalProductsForDateRange(startOfMonth: Date, endOfMonth: Date) {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.quantity)', 'total')
      .where('product.created_at BETWEEN :startOfMonth AND :endOfMonth', { startOfMonth, endOfMonth })
      .getRawOne();

    return result && result.total ? parseInt(result.total, 10) : 0;
  }

  async getTotalProducts() {
    const todaysDate = new Date();
    const lastMonth = subMonths(todaysDate, 1);

    const monthStarts = this.getDateRange(todaysDate).monthStarts;
    const monthEnds = this.getDateRange(todaysDate).monthEnds;
    const lastMonthStarts = this.getDateRange(lastMonth).monthStarts;
    const lastMonthEnds = this.getDateRange(lastMonth).monthEnds;

    const totalProductsThisMonth = await this.getTotalProductsForDateRange(monthStarts, monthEnds);

    const totalProductsLastMonth = await this.getTotalProductsForDateRange(lastMonthStarts, lastMonthEnds);

    let percentageChange;

    if (totalProductsLastMonth === totalProductsThisMonth) {
      percentageChange =
        totalProductsLastMonth === 0 ? 'No products to compare from last month' : 'No change from last month';
    } else if (totalProductsLastMonth === 0 && totalProductsThisMonth > 0) {
      percentageChange = `+100.00% from last month`;
    } else {
      const change = ((totalProductsThisMonth - totalProductsLastMonth) / totalProductsLastMonth) * 100;
      percentageChange = `${change > 0 ? '+' : ''}${change.toFixed(2)}% from last month`;
    }

    return {
      message: SYS_MSG.TOTAL_PRODUCTS_FETCHED_SUCCESSFULLY,
      data: {
        total_products: totalProductsThisMonth,
        percentage_change: percentageChange,
      },
    };
  }
}
