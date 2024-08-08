import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { CreateAdminDto } from './dto/admin.dto';
import { CreateAdminResponseDto } from './dto/create-admin-response.dto';
import { SeedingService } from './seeding.service';

@ApiTags('Seed')
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

  @Post('super-admin')
  async seedSuperAdmin(@Body() adminDetails: CreateAdminDto): Promise<CreateAdminResponseDto> {
    return this.seedingService.createSuperAdmin(adminDetails);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Seed transactions' })
  async seedTransactions() {
    return this.seedingService.seedTransactions();
  }
}
