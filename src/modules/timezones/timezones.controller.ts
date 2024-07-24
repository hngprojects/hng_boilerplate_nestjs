import { Controller, Get, UseGuards } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTimezoneDto } from './dto/create-timezone.dto';

@ApiTags('Timezones')
@ApiBearerAuth() // Indicates that this endpoint requires Bearer authentication
@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  @Get()
  @ApiOperation({ summary: 'Get supported timezones with authentication' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched timezones.',
    schema: {
      example: {
        status: 'success',
        status_code: 200,
        data: {
          timezones: [
            {
              id: 'string',
              timezone: 'String',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 'error',
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
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
