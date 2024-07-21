import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getSummary: jest.fn(),
    getLineChartData: jest.fn(),
    getBarChartData: jest.fn(),
    getPieChartData: jest.fn(),
    getAreaChartData: jest.fn(),
    getScatterPlotData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot()],
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockAnalyticsService }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getSummary', () => {
    it('should return summary data successfully', async () => {
      const result = { total_users: 5, active_users: 5, new_users: 5, total_revenue: '12350.00' };
      jest.spyOn(service, 'getSummary').mockResolvedValue(result);

      expect(await controller.getSummary()).toEqual({
        status: true,
        status_code: 200,
        ...result,
      });
    });

    it('should throw NotFoundException if data is not found', async () => {
      jest.spyOn(service, 'getSummary').mockRejectedValue(new NotFoundException());

      await expect(controller.getSummary()).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException on server error', async () => {
      jest.spyOn(service, 'getSummary').mockRejectedValue(new InternalServerErrorException());

      await expect(controller.getSummary()).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('getLineChartData', () => {
    it('should return line chart data successfully', async () => {
      const result = {
        labels: ['Active Users', 'Inactive Users'] as ('Active Users' | 'Inactive Users')[],
        data: [10, 20],
      };
      jest.spyOn(service, 'getLineChartData').mockResolvedValue(result);

      expect(await controller.getLineChartData()).toEqual({
        status: true,
        status_code: 200,
        ...result,
      });
    });

    it('should throw NotFoundException if data is not found', async () => {
      jest.spyOn(service, 'getLineChartData').mockRejectedValue(new NotFoundException());

      await expect(controller.getLineChartData()).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException on server error', async () => {
      jest.spyOn(service, 'getLineChartData').mockRejectedValue(new InternalServerErrorException());

      await expect(controller.getLineChartData()).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('getBarChartData', () => {
    it('should return bar chart data successfully', async () => {
      const result = {
        categories: ['Active Users', 'Inactive Users'] as ('Active Users' | 'Inactive Users')[],
        data: [30, 40],
      };
      jest.spyOn(service, 'getBarChartData').mockResolvedValue(result);

      expect(await controller.getBarChartData()).toEqual({
        status: true,
        status_code: 200,
        ...result,
      });
    });

    it('should throw NotFoundException if data is not found', async () => {
      jest.spyOn(service, 'getBarChartData').mockRejectedValue(new NotFoundException());

      await expect(controller.getBarChartData()).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException on server error', async () => {
      jest.spyOn(service, 'getBarChartData').mockRejectedValue(new InternalServerErrorException());

      await expect(controller.getBarChartData()).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('getPieChartData', () => {
    it('should return pie chart data successfully', async () => {
      const result = { segments: ['Category 1', 'Category 2'], values: [50, 50] };
      jest
        .spyOn(service, 'getPieChartData')
        .mockResolvedValue({ segments: ['Category 1', 'Category 2'], values: [50, 50] });

      expect(await controller.getPieChartData()).toEqual({
        status: true,
        status_code: 200,
        ...result,
      });
    });

    it('should throw NotFoundException if data is not found', async () => {
      jest.spyOn(service, 'getPieChartData').mockRejectedValue(new NotFoundException());

      await expect(controller.getPieChartData()).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException on server error', async () => {
      jest.spyOn(service, 'getPieChartData').mockRejectedValue(new InternalServerErrorException());

      await expect(controller.getPieChartData()).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('getAreaChartData', () => {
    it('should return area chart data successfully', async () => {
      const result = { labels: ['Q1', 'Q2'], data: [100, 200] };
      jest.spyOn(service, 'getAreaChartData').mockResolvedValue(result);

      expect(await controller.getAreaChartData()).toEqual({
        status: true,
        status_code: 200,
        ...result,
      });
    });

    it('should throw NotFoundException if data is not found', async () => {
      jest.spyOn(service, 'getAreaChartData').mockRejectedValue(new NotFoundException());

      await expect(controller.getAreaChartData()).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException on server error', async () => {
      jest.spyOn(service, 'getAreaChartData').mockRejectedValue(new InternalServerErrorException());

      await expect(controller.getAreaChartData()).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('getScatterPlotData', () => {
    it('should return scatter plot data successfully', async () => {
      const result = { labels: ['Point A', 'Point B'], data: [5, 10] };
      jest.spyOn(service, 'getScatterPlotData').mockResolvedValue(result);

      expect(await controller.getScatterPlotData()).toEqual({
        status: true,
        status_code: 200,
        ...result,
      });
    });

    it('should throw NotFoundException if data is not found', async () => {
      jest.spyOn(service, 'getScatterPlotData').mockRejectedValue(new NotFoundException());

      await expect(controller.getScatterPlotData()).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException on server error', async () => {
      jest.spyOn(service, 'getScatterPlotData').mockRejectedValue(new InternalServerErrorException());

      await expect(controller.getScatterPlotData()).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
