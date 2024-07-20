import { Controller, Get, Post } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { User } from 'src/entities/user.entity';
import { Profile } from 'src/entities/profile.entity';
import { Product } from 'src/entities/product.entity';
import { Organisation } from 'src/entities/organisation.entity';

@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  async seedDatabase(): Promise<string> {
    await this.seedingService.send();
    return 'Database seeding completed (if the database was empty)';
  }

  @Get('users')
  async getUsers(): Promise<User[]> {
    return this.seedingService.getUsers();
  }

  @Get('profiles')
  async getProfiles(): Promise<Profile[]> {
    return this.seedingService.getProfiles();
  }

  @Get('products')
  async getProducts(): Promise<Product[]> {
    return this.seedingService.getProducts();
  }

  @Get('organisations')
  async getOrganisations(): Promise<Organisation[]> {
    return this.seedingService.getOrganisations();
  }
}
