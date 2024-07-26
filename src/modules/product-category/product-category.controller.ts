
import { Controller,Post, Body} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { ApiTags, ApiBody} from '@nestjs/swagger';
@ApiTags('products/categories')
@Controller('products/categories')

export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}
  
  @Post()
  @ApiBody({ type: CreateProductCategoryDto })
  async create(@Body() createCategoryDto: CreateProductCategoryDto) {
    return {
      status_code: 201,
      category: await this.categoryService.create(createCategoryDto),
    };
  }

}


