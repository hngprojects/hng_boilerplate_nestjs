import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
@ApiTags('products/categories')
@Controller('products/categories')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Get()
  async findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return {
      status_code: 200,
      categories: await this.categoryService.getAllCategories(limit, offset),
    };
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: 'uuid-of-category' })
  async findOne(@Param('id') id: string) {
    return {
      status_code: 200,
      category: await this.categoryService.getCategoryById(id),
    };
  }

  @skipAuth()
  @Post()
  @ApiBody({ type: CreateProductCategoryDto })
  async create(@Body() createCategoryDto: CreateProductCategoryDto) {
    return {
      status_code: 201,
      category: await this.categoryService.createCategory(createCategoryDto),
    };
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: 'uuid-of-category' })
  @ApiBody({ type: UpdateProductCategoryDto })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateProductCategoryDto) {
    return {
      status_code: 200,
      category: await this.categoryService.updateCategory(id, updateCategoryDto),
    };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: 'uuid-of-category' })
  async remove(@Param('id') id: string) {
    await this.categoryService.removeCategory(id);
    return {
      status_code: 200,
      message: 'Category deleted successfully',
    };
  }
}
