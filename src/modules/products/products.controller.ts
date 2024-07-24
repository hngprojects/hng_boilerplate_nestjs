import { Controller, Post, Body, Delete, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiBody, ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /*
  @Get()
  @ApiBody({ type: CreateProductDto })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiBody({ type: CreateProductDto })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({ type: CreateProductDto })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }
  */

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. You must be authenticated to delete a product.' })
  @ApiResponse({ status: 404, description: 'Product with specified ID does not exist.' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
