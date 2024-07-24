import { Body, Controller, Param, Patch, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
