import { Controller, Get, HttpStatus, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('/analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary data' })
  @ApiOkResponse({ description: 'Successfully retrieved summary data' })
  @ApiNotFoundResponse({ description: 'Summary data not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getSummary() {
    try {
      const data = await this.analyticsService.getSummary();
      return {
        status: true,
        status_code: HttpStatus.OK,
        ...data,
      };
    } catch (error) {
      this.logger.error('Error in getSummary', error.stack);

      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          status: false,
          status_code: HttpStatus.NOT_FOUND,
          error: 'ResourceNotFound',
          message: 'The summary data could not be found.',
          details: { resource: 'Summary' },
        });
      }
      throw new InternalServerErrorException({
        status: false,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: 'An internal server error occurred.',
      });
    }
  }

  @Get('line-chart-data')
  @ApiOperation({ summary: 'Get line chart data' })
  @ApiOkResponse({ description: 'Successfully retrieved line chart data' })
  @ApiNotFoundResponse({ description: 'Line chart data not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getLineChartData() {
    try {
      const data = await this.analyticsService.getLineChartData();
      return {
        status: true,
        status_code: HttpStatus.OK,
        ...data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          status: false,
          status_code: HttpStatus.NOT_FOUND,
          error: 'DataFetchError',
          message: 'There was an error fetching the line chart data.',
          details: { chart_type: 'line' },
        });
      }
      throw new InternalServerErrorException({
        status: false,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: 'An internal server error occurred.',
      });
    }
  }

  @Get('bar-chart-data')
  @ApiOperation({ summary: 'Get bar chart data' })
  @ApiOkResponse({ description: 'Successfully retrieved bar chart data' })
  @ApiNotFoundResponse({ description: 'Bar chart data not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getBarChartData() {
    try {
      const data = await this.analyticsService.getBarChartData();
      return {
        status: true,
        status_code: HttpStatus.OK,
        ...data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          status: false,
          status_code: HttpStatus.NOT_FOUND,
          error: 'DataFetchError',
          message: 'There was an error fetching the bar chart data.',
          details: { chart_type: 'bar' },
        });
      }
      throw new InternalServerErrorException({
        status: false,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: 'An internal server error occurred.',
      });
    }
  }

  @Get('pie-chart-data')
  @ApiOperation({ summary: 'Get pie chart data' })
  @ApiOkResponse({ description: 'Successfully retrieved pie chart data' })
  @ApiNotFoundResponse({ description: 'Pie chart data not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getPieChartData() {
    try {
      const data = await this.analyticsService.getPieChartData();
      return {
        status: true,
        status_code: HttpStatus.OK,
        ...data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          status: false,
          status_code: HttpStatus.NOT_FOUND,
          error: 'DataFetchError',
          message: 'There was an error fetching the pie chart data.',
          details: { chart_type: 'pie' },
        });
      }
      throw new InternalServerErrorException({
        status: false,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: 'An internal server error occurred.',
      });
    }
  }

  @Get('area-chart-data')
  @ApiOperation({ summary: 'Get area chart data' })
  @ApiOkResponse({ description: 'Successfully retrieved area chart data' })
  @ApiNotFoundResponse({ description: 'Area chart data not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getAreaChartData() {
    try {
      const data = await this.analyticsService.getAreaChartData();
      return {
        status: true,
        status_code: HttpStatus.OK,
        ...data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          status: false,
          status_code: HttpStatus.NOT_FOUND,
          error: 'DataFetchError',
          message: 'There was an error fetching the area chart data.',
          details: { chart_type: 'area' },
        });
      }
      throw new InternalServerErrorException({
        status: false,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: 'An internal server error occurred.',
      });
    }
  }

  @Get('scatter-plot-data')
  @ApiOperation({ summary: 'Get scatter plot data' })
  @ApiOkResponse({ description: 'Successfully retrieved scatter plot data' })
  @ApiNotFoundResponse({ description: 'Scatter plot data not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getScatterPlotData() {
    try {
      const data = await this.analyticsService.getScatterPlotData();
      return {
        status: true,
        status_code: HttpStatus.OK,
        ...data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          status: false,
          status_code: HttpStatus.NOT_FOUND,
          error: 'DataFetchError',
          message: 'There was an error fetching the scatter plot data.',
          details: { chart_type: 'scatter' },
        });
      }
      throw new InternalServerErrorException({
        status: false,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: 'An internal server error occurred.',
      });
    }
  }
}
