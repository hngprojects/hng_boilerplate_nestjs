import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductSearchService } from './product-search.service';
import { ProductSearchController } from './product-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductSearchService],
  controllers: [ProductSearchController],
})
export class ProductSearchModule {}
