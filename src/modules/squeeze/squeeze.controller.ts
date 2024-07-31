import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SqueezeService } from './squeeze.service';
import { SqueezeRequestDto } from './dto/squeeze.dto';
import { skipAuth } from '../../helpers/skipAuth';

@ApiTags('Squeeze')
@Controller('squeeze')
export class SqueezeController {
  constructor(private readonly SqueezeService: SqueezeService) {}

  @ApiOperation({ summary: `Create squeeze record` })
  @skipAuth()
  @Post('/')
  async create(@Body() createSqueezeDto: SqueezeRequestDto, @Request() req) {
    return this.SqueezeService.create(createSqueezeDto);
  }
}
