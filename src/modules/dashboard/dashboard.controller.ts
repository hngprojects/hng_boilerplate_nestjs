import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { GetMoMStatisticsDto } from './dto/get-mom-statistics.dto';
import { SalesStatisticsDto } from './dto/get-sales-statistics.dto';
import { GetStatisticsDto } from './dto/get-statistics.dto';

@ApiTags('Admin Dashboard')
@Controller()
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashDashboardService: DashboardService) {}

  @Get('statistics')
  @ApiOkResponse({
    description: 'Admin Statistics Fetched',
    type: GetStatisticsDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getStatistics(): Promise<GetStatisticsDto> {
    return this.dashDashboardService.getStatistics();
  }

  @Get('analytics')
  @ApiOkResponse({
    description: 'Admin Analytics Fetched',
    type: GetMoMStatisticsDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMoMRevenue() {
    return this.dashDashboardService.getMoMRevenue();
  }

  @Get('sales')
  @ApiOkResponse({
    description: 'Admin Sales Data Fetch LogicIn Progress',
    type: SalesStatisticsDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getSales(): Promise<{ message: string }> {
    return this.dashDashboardService.getSales();
  }
}
