import { Controller, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { FetchSingleProductDto } from './dto/fetch-single-product.dto';
import { skipAuth } from 'src/helpers/skipAuth';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @skipAuth()
  @Post('/:productId')
  async fetchSingleProduct(@Param('productId') productId: string) {
    return this.productsService.fetchSingleProduct(productId);
  }
}
