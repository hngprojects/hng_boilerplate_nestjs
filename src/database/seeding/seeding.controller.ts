import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { CreateSeedingDto } from './dto/create-seeding.dto';
import { UpdateSeedingDto } from './dto/update-seeding.dto';

@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  create(@Body() createSeedingDto: CreateSeedingDto) {
    return this.seedingService.create(createSeedingDto);
  }

  @Get()
  findAll() {
    return this.seedingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seedingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeedingDto: UpdateSeedingDto) {
    return this.seedingService.update(+id, updateSeedingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seedingService.remove(+id);
  }
}
