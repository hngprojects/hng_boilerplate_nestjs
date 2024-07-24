import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { PaginationQueryDto } from './dto/ PaginationQueryDto';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard)
  @ApiTags('Products')
  @ApiBody({ type: CreateProductDto })
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto, @Req() req): Promise<any> {
    const product = await this.productsService.create(createProductDto);

    const category = product.category ? product.category.name : null;

    return {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: product.id,
        name: product.product_name,
        description: product.description,
        price: product.price,
        category: category,
        created_at: product.created_at.toISOString().split('T')[0],
        updated_at: product.updated_at.toISOString().split('T')[0],
      },
    };
  }

  @UseGuards(AuthGuard)
  @ApiTags('Products')
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.productsService.findAll(paginationQuery);
  }
}