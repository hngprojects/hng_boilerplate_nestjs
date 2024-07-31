import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { ProductComment } from '../product-comment/entities/product-comment.entity';
import { User } from '../user/entities/user.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [TypeOrmModule.forFeature([Product, Organisation, ProductComment, User])],
})
export class ProductsModule {}
