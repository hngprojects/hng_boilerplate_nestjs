import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ProductSearchService } from './product-search.service';
import { Product } from 'src/dist/product.entity';
@Controller('products')
export class ProductSearchController {
  constructor(private readonly productService: ProductSearchService) {}

  @Get('search')
  async searchProducts(
    @Query('name') name: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string
  ): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    if (name && typeof name !== 'string') {
      throw new BadRequestException('Invalid "name" parameter. Name must be a non-empty string.');
    }

    if (category && typeof category !== 'string') {
      throw new BadRequestException('Invalid "category" parameter. Category must be a string.');
    }

    const minPriceNumber = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNumber = maxPrice ? parseFloat(maxPrice) : undefined;

    if (minPrice && isNaN(minPriceNumber)) {
      throw new BadRequestException('Invalid "minPrice" parameter. MinPrice must be a number.');
    }

    if (maxPrice && isNaN(maxPriceNumber)) {
      throw new BadRequestException('Invalid "maxPrice" parameter. MaxPrice must be a number.');
    }

    try {
      const products = await this.productService.searchProducts(name, category, minPriceNumber, maxPriceNumber);

      return {
        success: true,
        // statusCode:200,
        products,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      };
    }
  }
}
