import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../entities/org.entity';
import { Product } from '../entities/products.entity';
import { Profile } from '../entities/profile.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Product, Organisation])],
  providers: [SeedingService],
  controllers: [SeedingController],
})
export class SeedingModule {}
