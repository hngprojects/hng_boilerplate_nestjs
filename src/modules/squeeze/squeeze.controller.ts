import { Controller, Post, Body } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { CreateSqueezeDto } from './dto/create-squeeze.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('squeeze')
@Controller('squeeze')
export class SqueezeController {
  constructor(private readonly squeezeService: SqueezeService) {}

  @skipAuth()
  @Post()
  @ApiOperation({ summary: 'Create Squeeze' })
  @ApiCreatedResponse({
    description: 'Squeeze record created successfully.',
    type: CreateSqueezeDto,
  })
  @ApiResponse({
    status: 400,
    description: 'request body missing required properties',
  })
  @ApiResponse({
    status: 422,
    description: 'Squeeze record for the provided email address already exists',
  })
  async createSqueeze(@Body() createSqueezeDto: CreateSqueezeDto) {
    return await this.squeezeService.createSqueeze(createSqueezeDto);
  }
}
