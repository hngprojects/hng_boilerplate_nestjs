import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/:productId')
  async fetchSingleProduct(@Param('productId') productId: string) {
    return this.productsService.fetchSingleProduct(productId);
  }
}
