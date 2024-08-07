import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { OrganisationMember } from '../organisations/entities/org-members.entity';
import { Comment } from '../comments/entities/comments.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, Organisation, ProductVariant, User, OrganisationMember, Comment]),
    UserModule,
  ],
})
export class ProductsModule {}
