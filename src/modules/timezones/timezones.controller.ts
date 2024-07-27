import { Controller, Post, Body, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateTimezoneDto } from './dto/create-timezone.dto';
import { TimezonesService } from './timezones.service';
import { Response } from 'express';

@ApiTags('Timezones')
@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new timezone' })
  @ApiBody({ type: CreateTimezoneDto })
  @ApiResponse({ status: 201, description: 'Timezone successfully created.' })
  @ApiResponse({ status: 409, description: 'Timezone already exists.' })
  async createTimezone(@Body() createTimezoneDto: CreateTimezoneDto, @Res() response: Response) {
    const result = await this.timezonesService.createTimezone(createTimezoneDto);
    return response.status(result.status_code).json(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all supported timezones' })
  @ApiResponse({ status: 200, description: 'List of supported timezones.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTimezones(@Res() response: Response): Promise<any> {
    const result = await this.timezonesService.getSupportedTimezones();
    return response.status(result.status_code).json(result);
  }
}
