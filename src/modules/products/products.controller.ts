import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDTO } from './dto/update-product.dto';
import { SuccessfulCreateResponseDto } from './dto/responses/create-product-response.dto';
import {
  BadRequestResponseDto,
  ServerErrorResponseDto,
  NotFoundResponseDto,
  NoResultsResponseDto,
  ForbiddenErrorResponseDto,
} from './dto/responses/error-response.dto';
import { StockResponseDto } from './dto/responses/stock-response.dto';
import { DeleteProductDto } from './dto/responses/delete-product.dto';
import { SearchResponseDto } from './dto/responses/search-products.dto';
import { ProductResponseDto } from './dto/responses/get-products.dto';

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
  @ApiResponse({ status: 201, description: 'Product created successfully', type: SuccessfulCreateResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid Organisation', type: BadRequestResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseDto })
  async createProduct(@Param('id') id: string, @Body() createProductDto: CreateProductRequestDto) {
    return this.productsService.createProduct(id, createProductDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for products' })
  @ApiParam({ name: 'id', description: 'organisation ID', example: '12345' })
  @ApiResponse({ status: 200, description: 'Products found successfully', type: SearchResponseDto })
  @ApiResponse({ status: 204, description: 'No products found', type: NoResultsResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid organisation', type: BadRequestResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseDto })
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
  @ApiResponse({ status: 404, description: 'Product not found', type: NotFoundResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseDto })
  async getById(@Param('orgId') id: string, @Param('id') productId: string) {
    return this.productsService.getProductById(productId);
  }

  @UseGuards(OwnershipGuard)
  @Patch('/:productId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully', type: SuccessfulCreateResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid organisation', type: BadRequestResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found', type: NotFoundResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseDto })
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
  @ApiResponse({ status: 200, description: 'Product deleted successfully', type: DeleteProductDto })
  @ApiResponse({ status: 422, description: 'Bad request', type: BadRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found', type: NotFoundResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseDto })
  async deleteProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.productsService.deleteProduct(id, productId);
  }

  @UseGuards(OwnershipGuard)
  @Get(':productId/stock')
  @ApiOperation({ summary: 'Gets a product stock details by id' })
  @ApiParam({ name: 'id', description: 'Organization ID', example: '12345' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product stock retrieved successfully', type: StockResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found', type: NotFoundResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseDto })
  async getProductStock(@Param('productId') productId: string) {
    return this.productsService.getProductStock(productId);
  }
}
