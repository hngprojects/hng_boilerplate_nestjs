// src/timezones/timezones.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTimezoneDto } from './dto/create-timezone.dto';

@ApiTags('Timezones')
@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Get()
  @ApiOperation({ summary: 'Get supported timezones without authentication' })
  @ApiResponse({ status: 200, description: 'Successfully fetched timezones.' })
  async getTimezonesWithoutAuth(): Promise<{
    status: string;
    status_code: number;
    data: { timezones: CreateTimezoneDto[] };
  }> {
    const timezones = await this.timezonesService.getSupportedTimezones();
    return {
      status: 'success',
      status_code: 200,
      data: {
        timezones,
      },
    };
  }
}
