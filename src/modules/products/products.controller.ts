import { Controller, Post, Body, Req, HttpException, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';

@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiOkResponse({ description: 'Product created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @skipAuth()
  @ApiTags('Products')
  @ApiBody({ type: CreateProductDto })
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto, @Req() req): Promise<any> {
    try {
      const product = await this.productsService.create(createProductDto);

      const category = product.category ? product.category.name : null;

      return {
        status: 'success',
        message: 'Product created successfully',
        data: {
          id: product.id,
          name: product.product_name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          category: category,
          created_at: product.created_at.toISOString().split('T')[0],
          updated_at: product.updated_at.toISOString().split('T')[0],
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException({
          status_code: 500,
          status: 'Internal server error',
          message: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  }
}
