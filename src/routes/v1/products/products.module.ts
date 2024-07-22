import { Module } from '@nestjs/common';
import { ProductsController } from '../../../controllers/v1/products.controller';
import { ProductsService } from '../../../services/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
