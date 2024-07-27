import { Controller, Get, Post, Body, Param, Patch, Delete, Query, HttpStatus } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ApiTags, ApiBody, ApiParam, ApiOperation } from '@nestjs/swagger';

@ApiTags('Products/categories')
@Controller('products/categories')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @ApiOperation({ summary: 'Get product categories' })
  @Get()
  async getAllCategories(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    const categories = await this.categoryService.findAllCategories(limit, offset);
    return {
      status_code: 200,
      categories: categories,
    };
  }

  @ApiOperation({ summary: 'reate product categories' })
  @Post()
  @ApiBody({ type: CreateProductCategoryDto })
  async createNewCategory(@Body() createCategoryDto: CreateProductCategoryDto) {
    const createdcategory = await this.categoryService.createCategory(createCategoryDto);
    return {
      status_code: 201,
      category: createdcategory,
    };
  }

  @ApiOperation({ summary: 'Update product categories' })
  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: '9dfcb8de-e36c-468f-acda-6f4d9a035451' })
  @ApiBody({ type: UpdateProductCategoryDto })
  async updateCategoryById(@Param('id') id: string, @Body() updateCategoryDto: UpdateProductCategoryDto) {
    const updatedCategory = await this.categoryService.updateCategory(id, updateCategoryDto);
    return {
      status_code: HttpStatus.OK,
      category: updatedCategory,
    };
  }

  @ApiOperation({ summary: 'Delete product categories' })
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: '9dfcb8de-e36c-468f-acda-6f4d9a035451' })
  async deleteCategoryById(@Param('id') id: string) {
    await this.categoryService.removeCategory(id);
    return {
      status_code: 200,
      message: 'Category deleted successfully',
    };
  }
}
