import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SeedingService],
  controllers: [SeedingController],
})
export class SeedingModule {}
