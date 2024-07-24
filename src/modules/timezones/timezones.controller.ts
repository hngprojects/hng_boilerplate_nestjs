// src/timezones/timezones.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTimezoneDto } from './dto/create-timezone.dto';
// import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Timezones')
@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  // Without authentication
  @Get()
  @ApiOperation({ summary: 'Get supported timezones without authentication' })
  @ApiResponse({ status: 200, description: 'Successfully fetched timezones.' })
  async getTimezonesWithoutAuth(): Promise<{ status: string; data: { timezones: CreateTimezoneDto[] } }> {
    const timezones = await this.timezonesService.getSupportedTimezones();
    return {
      status: 'success',
      data: {
        timezones,
      },
    };
  }
}

// With authentication
//   @Get()
//   @UseGuards(AuthGuard)
//   @ApiOperation({ summary: 'Get supported timezones with authentication' })
//   @ApiResponse({ status: 200, description: 'Successfully fetched timezones.' })
//   @ApiResponse({ status: 401, description: 'You are not authorised for this action' })
//   async getTimezonesWithAuth(): Promise<{ status: string; data: { timezones: CreateTimezoneDto[] } }> {
//     const timezones = await this.timezonesService.getSupportedTimezones();
//     return {
//       status: 'success',
//       data: {
//         timezones,
//       },
//     };
//   }
// }
