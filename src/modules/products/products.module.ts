import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/entities/comments.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { Cart } from '../revenue/entities/cart.entity';
import { OrderItem } from '../revenue/entities/order-items.entity';
import { Order } from '../revenue/entities/order.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Organisation, ProductVariant, Comment, User, Order, OrderItem, Cart]),
    UserModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
