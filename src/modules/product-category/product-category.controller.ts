import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
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
  async findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    try {
      const categories = await this.categoryService.findAll(limit, offset);
      return {
        status_code: 200,
        categories: categories,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException({
          status_code: 500,
          error: {
            status: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred while processing your request.',
            details: {
              support_email: 'support@example.com',
            },
          },
        });
      }
    }
  }

  @ApiOperation({ summary: 'reate product categories' })
  @Post()
  @ApiBody({ type: CreateProductCategoryDto })
  async create(@Body() createCategoryDto: CreateProductCategoryDto) {
    const createdcategory = await this.categoryService.create(createCategoryDto);
    return {
      status_code: 201,
      category: createdcategory,
    };
  }

  @ApiOperation({ summary: 'Update product categories' })
  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: '9dfcb8de-e36c-468f-acda-6f4d9a035451' })
  @ApiBody({ type: UpdateProductCategoryDto })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateProductCategoryDto) {
    const updatedCategory = await this.categoryService.updateCategory(id, updateCategoryDto);
    return {
      status_code: HttpStatus.OK,
      category: updatedCategory,
    };
  }

  @ApiOperation({ summary: 'Delete product categories' })
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Category ID', example: '9dfcb8de-e36c-468f-acda-6f4d9a035451' })
  async remove(@Param('id') id: string) {
    await this.categoryService.removeCategory(id);
    return {
      status_code: 200,
      message: 'Category deleted successfully',
    };
  }
}
