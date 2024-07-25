import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  static findAll: any;
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Getting the list of product' })
  @ApiTags('Products')
  @Get()
  findAllProducts(@Query('page') page: number, @Query('limit') limit: number) {
    return this.productsService.findAllProducts(page, limit);
  }
}
