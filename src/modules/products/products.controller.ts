import { Body, Controller, Get, HttpCode, Param, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { UpdateProductDTO } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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

  @Put('/:productId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProduct(@Param('productId') productId: string, @Body() updateProductDto: UpdateProductDTO) {
    return this.updateProduct(productId, updateProductDto);
  }
}
