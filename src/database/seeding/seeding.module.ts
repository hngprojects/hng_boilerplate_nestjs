import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from 'src/entities/user.entity';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { Product } from '../../entities/product.entity';
import { Organisation } from '../../entities/organisation.entity';
// import { Profile } from 'src/entities/profile.entity';
// import { Product } from 'src/entities/product.entity';
// import { Organisation } from 'src/entities/organisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Product, Organisation])],
  providers: [SeedingService],
  controllers: [SeedingController],
})
export class SeedingModule {}
