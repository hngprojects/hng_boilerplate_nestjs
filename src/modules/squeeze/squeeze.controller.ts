import { Body, Controller, Post, Request, Put, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { SqueezeService } from './squeeze.service';
import { SqueezeRequestDto } from './dto/squeeze.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';

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

  @skipAuth()
  @Put()
  @HttpCode(200)
  @ApiOperation({ summary: 'Update Squeeze Record' })
  @ApiResponse({
    description: 'Squeeze record updated successfully.',
    type: UpdateSqueezeDto,
    status: 200,
  })
  @ApiResponse({
    status: 400,
    description: 'request body missing required properties',
  })
  @ApiResponse({
    status: 404,
    description: 'No squeeze page record exists for the provided request body',
  })
  @ApiResponse({
    description: 'The squeeze page record can only be updated once.',
    status: 403,
  })
  async updateSqueeze(@Body() updateDto: UpdateSqueezeDto) {
    const updatedSqueeze = await this.SqueezeService.updateSqueeze(updateDto);
    return {
      message: 'Your record has been successfully updated. You cannot update it again.',
      status_code: 200,
      data: {
        ...updatedSqueeze,
      },
    };
  }
}
