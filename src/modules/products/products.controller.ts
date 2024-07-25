import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags} from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { PaginationQueryDto } from './dto/ PaginationQueryDto';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  
  
  @UseGuards(AuthGuard)
  @ApiTags('Products')
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.productsService.findAll(paginationQuery);
  }
}