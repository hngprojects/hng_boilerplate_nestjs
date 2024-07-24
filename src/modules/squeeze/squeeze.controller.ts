import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SqueezeService } from './squeeze.service';
import { SqueezeRequestDto } from './dto/squeeze.dto';

@ApiTags('Squeeze')
@Controller('squeeze')
export class SqueezeController {
  constructor(private readonly SqueezeService: SqueezeService) {}

  @Post('/')
  async create(@Body() createSqueezeDto: SqueezeRequestDto, @Request() req) {
    return this.SqueezeService.create(createSqueezeDto);
  }
}
