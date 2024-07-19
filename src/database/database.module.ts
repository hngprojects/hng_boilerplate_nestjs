import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { SeedingService } from './seeding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Waitlist])],
  providers: [SeedingService],
  exports: [TypeOrmModule, SeedingService],
})
export class DatabaseModule {}
