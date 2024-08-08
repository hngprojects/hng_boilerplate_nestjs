import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDTO } from './dto/update-product.dto';
import { DeleteProductDTO } from './dto/delete-product.dto';
import { isUUID } from 'class-validator';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { INVALID_ORG_ID, INVALID_PRODUCT_ID } from '../../helpers/SystemMessages';
import { AddCommentDto } from '../comments/dto/add-comment.dto';
import { GetTotalProductsResponseDto } from './dto/get-total-products.dto';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

@ApiBearerAuth()
@ApiTags('Products')
@Controller('organizations')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(SuperAdminGuard)
  @Get('/products/total')
  @ApiOkResponse({ type: GetTotalProductsResponseDto, description: 'Total Products fetched successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTotalProducts() {
    return await this.productsService.getTotalProducts();
  }

  @UseGuards(OwnershipGuard)
  @Post('/:orgId/products')
  @ApiOperation({ summary: 'Creates a new product' })
  @ApiParam({ name: 'id', description: 'organisation ID', example: '12345' })
  @ApiBody({ type: CreateProductRequestDto, description: 'Details of the product to be created' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProduct(@Param('orgId') orgId: string, @Body() createProductDto: CreateProductRequestDto) {
    return this.productsService.createProduct(orgId, createProductDto);
  }

  @Get('/:orgId/products/search')
  @ApiOperation({ summary: 'Search for products' })
  @ApiParam({ name: 'orgId', description: 'organisation ID', example: '12345' })
  @ApiResponse({ status: 200, description: 'Products found successfully' })
  @ApiResponse({ status: 204, description: 'No products found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchProducts(
    @Param('orgId') orgId: string,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number
  ) {
    return this.productsService.searchProducts(orgId, { name, category, minPrice, maxPrice });
  }

  @UseGuards(OwnershipGuard)
  @Get('/:orgId/products/:productId')
  @ApiOperation({ summary: 'Gets a product by id' })
  @ApiParam({ name: 'orgId', description: 'Organization ID', example: '12345' })
  @ApiResponse({ status: 200, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getById(@Param('orgId') id: string, @Param('productId') productId: string) {
    return this.productsService.getProductById(productId);
  }

  @UseGuards(OwnershipGuard)
  @Patch('/:orgId/products/:productId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProduct(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDTO
  ) {
    return this.productsService.updateProduct(orgId, productId, updateProductDto);
  }

  @UseGuards(OwnershipGuard)
  @Delete('/:orgId/products/:productId')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteProduct(@Param('orgId') orgId: string, @Param('productId') productId: string) {
    if (!isUUID(orgId)) {
      throw new CustomHttpException(INVALID_ORG_ID, HttpStatus.BAD_REQUEST);
    }
    if (!isUUID(productId)) {
      throw new CustomHttpException(INVALID_PRODUCT_ID, HttpStatus.BAD_REQUEST);
    }
    return this.productsService.deleteProduct(orgId, productId);
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

  @Get(':productId/stock')
  @ApiOperation({ summary: 'Gets a product stock details by id' })
  @ApiParam({ name: 'id', description: 'Organization ID', example: '12345' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product stock retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProductStock(@Param('productId') productId: string) {
    return this.productsService.getProductStock(productId);
  }
}
