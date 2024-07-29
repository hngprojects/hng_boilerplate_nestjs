import { Body, Controller, Get, Param, Patch, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { StatusType } from './entities/product.entity';

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

  @Patch(':productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change product status(Super admin)' })
  @ApiParam({ name: 'productId', type: String, description: 'Product Id' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'forbidden user' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async changeProductStatus(
    @Param('productId') productId: string,
    @Body() body: { status: StatusType },
    @Request() req
  ) {
    return await this.productsService.changeProductStatus(productId, req.user.id, body.status);
  }
}
