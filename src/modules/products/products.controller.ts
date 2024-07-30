import { Body, Controller, Param, Patch, Request, UseGuards, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { StatusType } from './entities/product.entity';
// import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
// import { ProductsService } from './products.service';
// import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  @Patch(':productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change product status(Super admin)' })
  @ApiParam({ name: 'productId', type: String, description: 'Product Id' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'forbidden user' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async changeProductStatus(
    @Param('productId') productId: string,
    @Body() body: { status: StatusType },
    @Request() req
  ) {
    return await this.productsService.changeProductStatus(productId, req.user.id, body.status);
  }
}
