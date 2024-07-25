import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Req } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
@ApiTags('products/categories')
@Controller('products/categories')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Post()
  @ApiBody({ type: CreateProductCategoryDto })
  async create(@Body() createCategoryDto: CreateProductCategoryDto) {
    return {
      status_code: 201,
      category: await this.categoryService.createCategory(createCategoryDto),
    };
  }
}
