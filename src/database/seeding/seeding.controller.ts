import { Controller, Get, Post } from '@nestjs/common';
import { SeedingService } from './seeding.service';

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

  @Get('profiles')
  async getProfiles() {
    return this.seedingService.getProfiles();
  }

  @Get('products')
  async getProducts() {
    return this.seedingService.getProducts();
  }

  @Get('organisations')
  async getOrganisations() {
    return this.seedingService.getOrganisations();
  }
}