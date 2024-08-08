import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller()
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashDashboardService: DashboardService) {}

  @Get('statistics')
  @ApiOkResponse({
    description: 'Revenue Fetched',
    schema: {
      properties: {
        message: { type: 'string' },
        data: {
          properties: {
            totalRevenueCurrentMonth: { type: 'number' },
            revenuePercentChange: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getStatistics(): Promise<any> {
    return this.dashDashboardService.getStatistics();
  }
}
