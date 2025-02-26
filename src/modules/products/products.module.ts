import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { UserModule } from '@modules/user/user.module';
import { Cart } from '@modules/dashboard/entities/cart.entity';
import { OrderItem } from '@modules/dashboard/entities/order-items.entity';
import { Role } from '@modules/role/entities/role.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { User } from '@modules/user/entities/user.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { Order } from '@modules/dashboard/entities/order.entity';
import { Comment } from '@modules/comments/entities/comments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Organisation,
      ProductVariant,
      User,
      OrganisationUserRole,
      Role,
      Comment,
      Order,
      OrderItem,
      Cart,
    ]),
    UserModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
