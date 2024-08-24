import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiStatusService } from './api-status.service';
import { CreateApiStatusDto } from './dto/create-api-status.dto';
import { skipAuth } from 'src/helpers/skipAuth';

@Controller('api-status')
export class ApiStatusController {
  constructor(private readonly apiStatusService: ApiStatusService) {}

  @skipAuth()
  @Post()
  create(@Body() createApiStatusDto: CreateApiStatusDto[]) {
    return this.apiStatusService.create(createApiStatusDto);
  }

  @skipAuth()
  @Get()
  findAll() {
    return this.apiStatusService.findAll();
  }
}
