import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ProductSearchService } from './product-search.service';
import { Product } from '../dist/product.entity';
@Controller('products')
export class ProductSearchController {
  constructor(private readonly productService: ProductSearchService) {}

  @Get('search')
  async searchProducts(
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string
  ): Promise<{ success: boolean; statusCode?: number; products?: Product[]; error?: string }> {
    const minPriceNumber = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNumber = maxPrice ? parseFloat(maxPrice) : undefined;

    if (minPrice && isNaN(minPriceNumber)) {
      throw new BadRequestException('Invalid "minPrice" parameter. MinPrice must be a number.');
    }

    if (maxPrice && isNaN(maxPriceNumber)) {
      throw new BadRequestException('Invalid "maxPrice" parameter. MaxPrice must be a number.');
    }

    if (minPriceNumber !== undefined && maxPriceNumber !== undefined && maxPriceNumber < minPriceNumber) {
      throw new BadRequestException(
        'Invalid "maxPrice" parameter. MaxPrice should be greater than or equal to MinPrice.'
      );
    }

    try {
      const products = await this.productService.searchProducts(name, category, minPriceNumber, maxPriceNumber);
      if (products.length == 0) {
        return {
          success: true,
          statusCode: 204,
          products,
        };
      }

      return {
        success: true,
        statusCode: 200,
        products,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        error: 'An unexpected error occurred. Please try again later.',
      };
    }
  }
}
