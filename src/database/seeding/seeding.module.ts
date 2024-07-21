import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { Product } from '../../entities/product.entity';
import { Organisation } from '../../entities/organisation.entity';
import { Revenue } from '../../entities/revenue.entity';
import { SeedingController } from './seeding.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Product, Organisation, Revenue])],
  providers: [SeedingService],
  controllers: [SeedingController],
})
export class SeedingModule {}
