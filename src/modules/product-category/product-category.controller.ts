import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('products/categories')
@UseGuards(AuthGuard)
@Controller('products/categories')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Get()
  async findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return {
      status_code: 200,
      categories: await this.categoryService.findAll(limit, offset),
    };
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: 'uuid-of-category' })
  async findOne(@Param('id') id: string) {
    return {
      status_code: 200,
      category: await this.categoryService.findOne(id),
    };
  }

  @Post()
  @ApiBody({ type: CreateProductCategoryDto })
  async create(@Body() createCategoryDto: CreateProductCategoryDto) {
    return {
      status_code: 201,
      category: await this.categoryService.create(createCategoryDto),
    };
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: 'uuid-of-category' })
  @ApiBody({ type: UpdateProductCategoryDto })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateProductCategoryDto) {
    return {
      status_code: 200,
      category: await this.categoryService.update(id, updateCategoryDto),
    };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: 'uuid-of-category' })
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
    return {
      status_code: 200,
      message: 'Category deleted successfully',
    };
  }
}
