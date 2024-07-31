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
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>,
    @InjectRepository(ProductVariant) private productVariantRepository: Repository<ProductVariant>
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
    if (!newProduct)
      throw new InternalServerErrorException({
        status_code: 500,
        status: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      });

    const statusCal = await this.calculateProductStatus(dto.quantity);
    newProduct.status = statusCal;

    const product = await this.productRepository.save(newProduct);

    return {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.variants[0].price,
        status: product.status,
        quantity: product.variants[0].quantity,
        created_at: product.created_at,
        updated_at: product.updated_at,
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

    const calculateProductStatus = await this.calculateProductStatus(
      product.variants.reduce((acc, variant) => acc + variant.quantity, 0)
    );

    product.status = calculateProductStatus;

    const currentProduct = await this.productRepository.save(product);

    return {
      status_code: HttpStatus.OK,
      message: 'Product updated successfully',
      data: currentProduct,
    };
  }

  async calculateProductStatus(quantity: number): Promise<ProductStatusType> {
    if (quantity === 0) return ProductStatusType.OUT_STOCK;
    return quantity >= 5 ? ProductStatusType.IN_STOCK : ProductStatusType.LOW_STOCK;
  }
}
