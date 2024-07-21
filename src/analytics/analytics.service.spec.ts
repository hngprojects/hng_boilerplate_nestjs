import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Revenue } from '../entities/revenue.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let userRepository: Repository<User>;
  let revenueRepository: Repository<Revenue>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Revenue),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    revenueRepository = module.get<Repository<Revenue>>(getRepositoryToken(Revenue));
  });

  describe('getSummary', () => {
    it('should return summary data', async () => {
      const mockUserCount = 10;
      const mockActiveUserCount = 8;
      const mockNewUserCount = 2;
      const mockTotalRevenue = { sum: 1000 };

      jest.spyOn(userRepository, 'count')
        .mockResolvedValueOnce(mockUserCount)
        .mockResolvedValueOnce(mockActiveUserCount)
        .mockResolvedValueOnce(mockNewUserCount);
      jest.spyOn(mockQueryBuilder, 'getRawOne').mockResolvedValueOnce(mockTotalRevenue);

      const result = await service.getSummary();
      expect(result).toEqual({
        total_users: mockUserCount,
        active_users: mockActiveUserCount,
        new_users: mockNewUserCount,
        total_revenue: mockTotalRevenue.sum,
      });
    });

    it('should throw NotFoundException when no data found', async () => {
      jest.spyOn(userRepository, 'count').mockResolvedValueOnce(0).mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      jest.spyOn(mockQueryBuilder, 'getRawOne').mockResolvedValueOnce({ sum: 0 });

      await expect(service.getSummary()).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(userRepository, 'count').mockRejectedValueOnce(new Error('Database error'));
      await expect(service.getSummary()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getLineChartData', () => {
    it('should return line chart data', async () => {
      const mockData = [
        { month: '2024-01-01', total: 100 },
        { month: '2024-02-01', total: 200 },
      ];

      jest.spyOn(mockQueryBuilder, 'getRawMany').mockResolvedValueOnce(mockData);

      const result = await service.getLineChartData();
      expect(result).toEqual({
        labels: ['2024-01-01', '2024-02-01'],
        data: [100, 200],
      });
    });

    it('should throw an error if fetching fails', async () => {
      jest.spyOn(mockQueryBuilder, 'getRawMany').mockRejectedValueOnce(new Error('Fetch error'));

      await expect(service.getLineChartData()).rejects.toThrow('Failed to fetch line chart data: Fetch error');
    });
  });

  describe('getBarChartData', () => {
    it('should return bar chart data', async () => {
      const mockData = [
        { isActive: true, count: 8 },
        { isActive: false, count: 2 },
      ];

      jest.spyOn(mockQueryBuilder, 'getRawMany').mockResolvedValueOnce(mockData);

      const result = await service.getBarChartData();
      expect(result).toEqual({
        categories: ['Active Users', 'Inactive Users'],
        data: [8, 2],
      });
    });

    it('should throw an error if fetching fails', async () => {
      jest.spyOn(mockQueryBuilder, 'getRawMany').mockRejectedValueOnce(new Error('Fetch error'));

      await expect(service.getBarChartData()).rejects.toThrow('Failed to fetch bar chart data: Fetch error');
    });
  });

  describe('getPieChartData', () => {
    it('should return pie chart data', async () => {
      const mockData = [
        { year: '2024-01-01', count: 10 },
        { year: '2025-01-01', count: 20 },
      ];

      jest.spyOn(mockQueryBuilder, 'getRawMany').mockResolvedValueOnce(mockData);

      const result = await service.getPieChartData();
      expect(result).toEqual({
        segments: ['2024-01-01', '2025-01-01'],
        values: [10, 20],
      });
    });

    it('should throw an error if fetching fails', async () => {
      jest.spyOn(mockQueryBuilder, 'getRawMany').mockRejectedValueOnce(new Error('Fetch error'));

      await expect(service.getPieChartData()).rejects.toThrow('Failed to fetch pie chart data: Fetch error');
    });
  });

  describe('getAreaChartData', () => {
    it('should return area chart data', async () => {
      const mockData = [
        { month: '2024-01-01', total: 100 },
        { month: '2024-02-01', total: 200 },
      ];

      jest.spyOn(mockQueryBuilder, 'getRawMany').mockResolvedValueOnce(mockData);

      const result = await service.getAreaChartData();
      expect(result).toEqual({
        labels: ['2024-01-01', '2024-02-01'],
        data: [100, 200],
      });
    });

    it('should throw an error if fetching fails', async () => {
      jest.spyOn(mockQueryBuilder, 'getRawMany').mockRejectedValueOnce(new Error('Fetch error'));

      await expect(service.getAreaChartData()).rejects.toThrow('Failed to fetch area chart data: Fetch error');
    });
  });

  describe('getScatterPlotData', () => {
    it('should return scatter plot data', async () => {
      const mockData = [
        { month: '2024-01-01', count: 10 },
        { month: '2024-02-01', count: 20 },
      ];

      jest.spyOn(mockQueryBuilder, 'getRawMany').mockResolvedValueOnce(mockData);

      const result = await service.getScatterPlotData();
      expect(result).toEqual({
        labels: ['2024-01-01', '2024-02-01'],
        data: [10, 20],
      });
    });

    it('should handle scatter plot data fetch error', async () => {
      jest.spyOn(mockQueryBuilder, 'getRawMany').mockRejectedValueOnce(new Error('Fetch error'));

      await expect(service.getScatterPlotData()).rejects.toThrow('Failed to fetch scatter plot data: Fetch error');
    });
  });
});
