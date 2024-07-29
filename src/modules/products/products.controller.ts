import { Controller, Delete, Get, HttpException, NotFoundException, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiParam, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/:productId')
  @ApiOperation({ summary: 'Fetch a single product by id' })
  @ApiParam({ name: 'productId', type: String, description: 'Product Id' })
  @ApiResponse({ status: 200, description: 'Product fetched successfully' })
  @ApiResponse({ status: 400, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fetchSingleProduct(@Param('productId') productId: string) {
    return this.productsService.fetchSingleProduct(productId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. You must be authenticated to delete a product.' })
  @ApiResponse({ status: 404, description: 'Product with specified ID does not exist.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.productsService.removeProduct(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.getResponse(), error.getStatus());
      }
      throw error;
    }
  }
}
