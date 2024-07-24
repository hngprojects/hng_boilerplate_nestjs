import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { skipAuth } from '../../helpers/skipAuth';

@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductsService) {}

  @skipAuth()
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
}
