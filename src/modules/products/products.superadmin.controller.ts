import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDTO } from './dto/update-product.dto';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

@ApiTags('add-Product-superAdmin')
@Controller('admin/products/:id')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(SuperAdminGuard)
  @Post('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new product by super admin' })
  @ApiParam({ name: 'id', description: 'organisation ID', example: '12345' })
  @ApiBody({ type: CreateProductRequestDto, description: 'Details of the product to be created' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProductBySuperAdmin(@Param('id') id: string, @Body() createProductDto: CreateProductRequestDto) {
    return this.productsService.createProduct(id, createProductDto);
  }
}
