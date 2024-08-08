import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetRevenueResponseDto } from './dto/get-revenue-response.dto';
import { RevenueService } from './revenue.service';

@ApiTags('Dashboard')
@Controller('revenue')
@ApiBearerAuth()
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
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
  getRevenue(): Promise<GetRevenueResponseDto> {
    return this.revenueService.getRevenue();
  }
}
