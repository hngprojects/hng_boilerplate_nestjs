import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDTO } from './dto/update-product.dto';
import { AddCommentDto } from '../comments/dto/add-comment.dto';

@ApiTags('Products')
@Controller('/organizations/:id/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(OwnershipGuard)
  @Post('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new product' })
  @ApiParam({ name: 'id', description: 'organisation ID', example: '12345' })
  @ApiBody({ type: CreateProductRequestDto, description: 'Details of the product to be created' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProduct(@Param('id') id: string, @Body() createProductDto: CreateProductRequestDto) {
    return this.productsService.createProduct(id, createProductDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for products' })
  @ApiParam({ name: 'id', description: 'organisation ID', example: '12345' })
  @ApiResponse({ status: 200, description: 'Products found successfully' })
  @ApiResponse({ status: 204, description: 'No products found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchProducts(
    @Param('id') id: string,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number
  ) {
    return this.productsService.searchProducts(id, { name, category, minPrice, maxPrice });
  }

  @UseGuards(OwnershipGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Gets a product by id' })
  @ApiParam({ name: 'id', description: 'Organization ID', example: '12345' })
  @ApiBody({ type: CreateProductRequestDto, description: 'Details of the product to be created' })
  @ApiResponse({ status: 200, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getById(@Param('orgId') id: string, @Param('id') productId: string) {
    return this.productsService.getProductById(productId);
  }

  @UseGuards(OwnershipGuard)
  @Patch('/:productId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDTO
  ) {
    return this.productsService.updateProduct(id, productId, updateProductDto);
  }

  @UseGuards(OwnershipGuard)
  @Delete(':productId')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.productsService.deleteProduct(id, productId);
  }

  @UseGuards(OwnershipGuard)
  @Post('/:productId/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a comment for a product' })
  @ApiParam({ name: 'id', description: 'organisation ID', example: '870ccb14-d6b0-4a50-b459-9895af803i89' })
  @ApiParam({ name: 'productId', description: 'product ID', example: '126ccb14-d6b0-4a50-b459-9895af803h6y' })
  @ApiBody({ type: AddCommentDto, description: 'Comment to be added' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addCommentToProduct(@Param('productId') productId: string, @Body() commentDto: AddCommentDto, @Req() req: any) {
    const user = req.user;
    return this.productsService.addCommentToProduct(productId, commentDto, user.sub);
  }
}
