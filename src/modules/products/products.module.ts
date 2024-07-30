import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import UserService from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

// @Module({
//   controllers: [ProductsController],
//   providers: [ProductsService, UserService],
//   imports: [TypeOrmModule.forFeature([Product, User])],

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, UserService],
  imports: [TypeOrmModule.forFeature([Product, Organisation, User])],
})
export class ProductsModule {}
