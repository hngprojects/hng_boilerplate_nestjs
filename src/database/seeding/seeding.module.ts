import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { Product } from '../../entities/product.entity';
import { Organisation } from '../../entities/organisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Product, Organisation])],
  providers: [SeedingService],
  controllers: [SeedingController],
})
export class SeedingModule { }
