import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { OrderItem } from './entities/order-items.entity';
import { Order } from './entities/order.entity';
import { Transaction } from './entities/transaction.entity';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Order, OrderItem, Cart])],
  controllers: [RevenueController],
  providers: [RevenueService],
})
export class RevenueModule {}
