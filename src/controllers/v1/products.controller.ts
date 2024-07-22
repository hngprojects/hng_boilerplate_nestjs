import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../middlewares/auth/jwt-auth.guard';
import { ProductsService } from '../../services/products.service';
import { CreateProductDto } from '../../interfaces/create-product.dto';
import { Product } from '../../entities/product.entity';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }
}
