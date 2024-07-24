import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @skipAuth()
  @Get('/:productId')
  async fetchSingleProduct(@Param('productId') productId: string) {
    return this.productsService.fetchSingleProduct(productId);
  }
}
