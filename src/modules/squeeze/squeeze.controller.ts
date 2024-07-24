import { Controller, Post, Body } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { CreateSqueezeDto } from './dto/create-squeeze.dto';
import { skipAuth } from '../../helpers/skipAuth';

@Controller('squeeze')
export class SqueezeController {
  constructor(private readonly squeezeService: SqueezeService) {}

  @skipAuth()
  @Post()
  async create(@Body() createSqueezeDto: CreateSqueezeDto) {
    return await this.squeezeService.create(createSqueezeDto);
  }
}
