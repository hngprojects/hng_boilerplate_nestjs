// import { Controller, Post, Body, Req, HttpException, InternalServerErrorException } from '@nestjs/common';
// import { ProductsService } from './products.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import { ApiTags, ApiBody } from '@nestjs/swagger';

// @Controller('products')
// export class ProductController {
//   constructor(private readonly productsService: ProductsService) {}

//   @ApiTags('Products')
//   @ApiBody({ type: CreateProductDto })
//   @Post()
//   async createProduct(@Body() createProductDto: CreateProductDto, @Req() req): Promise<any> {
//     try {
//       const product = await this.productsService.create(createProductDto);

//       const category = product.category ? product.category.name : null;

//       return {
//         status: 'success',
//         message: 'Product created successfully',
//         data: {
//           id: product.id,
//           name: product.product_name,
//           description: product.description,
//           price: product.price,
//           category: category,
//           created_at: product.created_at.toISOString().split('T')[0],
//           updated_at: product.updated_at.toISOString().split('T')[0],
//         },
//       };
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       } else {
//         throw new InternalServerErrorException({
//           status_code: 500,
//           status: 'Internal server error',
//           message: 'An unexpected error occurred. Please try again later.',
//         });
//       }
//     }
//   }
// }
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from '../../guards/authorization.guard';
import { CreateProductRequestDto } from './dto/create-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(OwnershipGuard)
  @Post(':id')
  @ApiOperation({ summary: 'Creates a new product' })
  @ApiParam({ name: 'id', description: 'Organization ID', example: '12345' })
  @ApiBody({ type: CreateProductRequestDto, description: 'Details of the product to be created' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createProduct(@Param('id') id: string, @Body() createProductDto: CreateProductRequestDto) {
    return this.productsService.createProduct(id, createProductDto);
  }
}
