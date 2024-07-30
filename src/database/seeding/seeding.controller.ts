import { Controller, Get, Post } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { skipAuth } from 'src/helpers/skipAuth';

@skipAuth()
@Controller('seed')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  async seedDatabase() {
    await this.seedingService.seedDatabase();
    return { message: 'Database seeding initiated' };
  }

  @Get('users')
  async getUsers() {
    return this.seedingService.getUsers();
  }
}
