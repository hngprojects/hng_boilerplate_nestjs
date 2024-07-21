import {
  Controller,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './service/products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('/api/vi/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete a product by id' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteProduct(@Param('id') id: string, @Req() req) {
    try {
      await this.productService.deleteProduct(id);
      return { message: 'Product deleted successfully' };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new HttpException(
          {
            err: 'Product not found',
            message: err.message,
          },
          HttpStatus.NOT_FOUND
        );
      }
      if (err instanceof ForbiddenException) {
        throw new HttpException(
          {
            err: 'Forbidden',
            message: err.message,
          },
          HttpStatus.FORBIDDEN
        );
      }
      throw new HttpException(
        {
          err: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
