import { Controller, Get, HttpException, NotFoundException, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiBearerAuth()
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  static findAll: any;
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Getting the list of products' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. You must be authenticated to get list of products.' })
  async findAllProducts(@Query('page') page: number, @Query('limit') limit: number) {
    try {
      return await this.productsService.findAllProducts(page, limit)
    } catch (error) {
      if(error instanceof NotFoundException){
        throw new HttpException(error.getResponse(), error.getStatus());
      }
      throw error
    }
  }
}
