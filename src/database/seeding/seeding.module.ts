import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Profile } from 'src/database/entities/profile.entity';
import { Product } from 'src/database/entities/product.entity';
import { Organisation } from 'src/database/entities/organisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Product, Organisation])],
  providers: [SeedingService],
  controllers: [SeedingController],
})
export class SeedingModule {}
