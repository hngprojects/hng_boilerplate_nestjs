import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductCategory } from '../../modules/product-category/entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, ProductCategory])],
  providers: [SeedingService],
  controllers: [SeedingController],
})
export class SeedingModule {}
