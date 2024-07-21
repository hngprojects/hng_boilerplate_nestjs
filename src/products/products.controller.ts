import { Controller, Get, Query, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ page: number, limit: number, total: number, results: Product[]; message?:string }> {
    // Validate query parameter
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new BadRequestException('The query parameter \'q\' is required and must be a non-empty string.');
    }

    try {
      // Perform search and get results
      const { results, total } = await this.productsService.searchProducts(query, page, limit);

      // Handle case where no results are found
      if (results.length === 0) {
        return {
          page,
          limit,
          total,
          results,
          message: 'No results found',
        };
      }

      return {
        page,
        limit,
        total,
        results,
      };
    } catch (error) {
      throw new InternalServerErrorException('An unexpected error occurred. Please try again later.');
    }
  }
}


// import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
// import { ProductsService } from './products.service';
// import { Product } from './entities/product.entity';


// @Controller('products')
// export class ProductsController {
//   constructor(private readonly productsService: ProductsService) {}

//   @Get('search')
//   async search(
//     @Query('q') query: string,
//     @Query('page') page: number = 1,
//     @Query('limit') limit: number = 10,
//   ): Promise<{ page: number, limit: number, total: number, results: Product[] }> {
//     if (!query || typeof query !== 'string' || query.trim() === '') {
//       throw new BadRequestException('The query parameter \'q\' is required and must be a non-empty string.');
//     }

//     const { results, total } = await this.productsService.searchProducts(query, page, limit);

//     return {
//       page,
//       limit,
//       total,
//       results,
//     };
//   }
// }
