import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from '../newsletter-subscription/entities/newsletter-subscription.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Cart } from './entities/cart.entity';
import { OrderItem } from './entities/order-items.entity';
import { Order } from './entities/order.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Order, OrderItem, Cart, NewsletterSubscription])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class RevenueModule {}
