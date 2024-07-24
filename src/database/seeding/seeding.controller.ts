import { Controller, Get, Post } from '@nestjs/common';
import { SeedingService } from './seeding.service';

@Controller('seed')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) { }

  @Post()
  async seedDatabase() {
    await this.seedingService.seedDatabase();
    return { message: 'Database seeding initiated' };
  }
}
