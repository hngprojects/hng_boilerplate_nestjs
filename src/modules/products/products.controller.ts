import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { CreateCommentDto } from './dto/create-commemt.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(OwnershipGuard)
  @Post(':id')
  @ApiOperation({ summary: 'Creates a new product' })
  @ApiParam({ name: 'id', description: 'Organization ID', example: '12345' })
  @ApiBody({ type: CreateProductRequestDto, description: 'Details of the product to be created' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProduct(@Param('id') id: string, @Body() createProductDto: CreateProductRequestDto) {
    return this.productsService.createProduct(id, createProductDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for products' })
  @ApiResponse({ status: 200, description: 'Products found successfully' })
  @ApiResponse({ status: 204, description: 'No products found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchProducts(
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number
  ) {
    return this.productsService.searchProducts({ name, category, minPrice, maxPrice });
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '12345' })
  @ApiBody({ type: CreateCommentDto, description: 'Comment details' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addComment(@Param('id') id: string, @Body() createCommentDto: CreateCommentDto) {
    return this.productsService.addComment(id, createCommentDto);
  }
}
