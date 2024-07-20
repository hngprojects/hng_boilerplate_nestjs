import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
// import { SeedingController } from './seeding.controller';

@Module({
  providers: [SeedingService],
})
export class SeedingModule {}
