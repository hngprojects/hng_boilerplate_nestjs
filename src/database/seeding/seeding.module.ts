import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';

@Module({
  controllers: [SeedingController],
  providers: [SeedingService],
})
export class SeedingModule {}
