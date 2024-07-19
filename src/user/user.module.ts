import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OrganisationService } from 'src/organisation/organisation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ProfileService } from 'src/profile/profile.service';
import { ProductsService } from 'src/products/products.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, OrganisationService, ProfileService, ProductsService],
})
export class UserModule {}
