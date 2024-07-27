import { Controller,Post, Body, HttpStatus} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { ApiTags, ApiBody} from '@nestjs/swagger';
@ApiTags('products-categories')
@Controller('products-categories')

export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) {}
  
  @Post()
  @ApiBody({ type: CreateProductCategoryDto })
  async createProductCategory(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    const data = await this.productCategoryService.createProductCategory(createProductCategoryDto)
    return {
      message: 'Product Category created successfully',
      status_code: HttpStatus.CREATED,
      data,
    };
  }

}


