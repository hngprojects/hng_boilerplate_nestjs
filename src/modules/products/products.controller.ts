import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { UpdateProductDTO } from './dto/update-product.dto';
import { Body, Controller, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateProductRequestDto } from './dto/create-product.dto';

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

  @Put('/:productId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProduct(@Param('productId') productId: string, @Body() updateProductDto: UpdateProductDTO) {
    return this.updateProduct(productId, updateProductDto);
  }
}
