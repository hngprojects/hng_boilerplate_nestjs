import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @skipAuth()
  @Get()
  @ApiOperation({ summary: 'get the list of products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllProducts(@Query('page') page: number, @Query('limit') limit: number) {
    return this.productsService.findAllProducts(page, limit);
  }
  @skipAuth()
  @Get('/:productId')
  @ApiOperation({ summary: 'Fetch a single product by id' })
  @ApiParam({ name: 'productId', type: String, description: 'Product Id' })
  @ApiResponse({ status: 200, description: 'Product fetched successfully' })
  @ApiResponse({ status: 400, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fetchSingleProduct(@Param('productId') productId: string) {
    return this.productsService.fetchSingleProduct(productId);
  }
}
