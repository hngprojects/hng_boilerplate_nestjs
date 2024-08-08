import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { NewsletterSubscription } from '../newsletter-subscription/entities/newsletter-subscription.entity';
import { DashboardService } from './dashboard.service';
import { Transaction } from './entities/transaction.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let transactionRepository: Repository<Transaction>;
  let newsletterSubscriptionRepository: Repository<NewsletterSubscription>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NewsletterSubscription),
          useValue: {
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    newsletterSubscriptionRepository = module.get<Repository<NewsletterSubscription>>(
      getRepositoryToken(NewsletterSubscription)
    );
  });

  describe('getPercentageDifference', () => {
    it('should return "100.00%" if previous value is 0', () => {
      const result = service['getPercentageDifference'](10, 0);
      expect(result).toBe('100.00%');
    });

    it('should return the correct percentage difference', () => {
      const result = service['getPercentageDifference'](120, 100);
      expect(result).toBe('20.00%');
    });
  });

  describe('getRevenue', () => {
    it('should return revenue data with percentage difference', async () => {
      const mockCurrentMonthRevenue = { revenue: '1000' };
      const mockPreviousMonthRevenue = { revenue: '800' };

      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockCurrentMonthRevenue),
      } as any);

      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockPreviousMonthRevenue),
      } as any);

      const result = await service['getRevenue']();
      expect(result).toEqual({
        message: SYS_MSG.REVENUE_FETCHED_SUCCESSFULLY,
        data: {
          totalRevenueCurrentMonth: '1000',
          totalRevenuePreviousMonth: '800',
          revenuePercentChange: '25.00%',
        },
      });
    });
  });

  describe('getSubscriptions', () => {
    it('should return subscription counts with percentage difference', async () => {
      jest.spyOn(newsletterSubscriptionRepository, 'findAndCount').mockResolvedValueOnce([[], 50]);
      jest.spyOn(newsletterSubscriptionRepository, 'findAndCount').mockResolvedValueOnce([[], 40]);

      const result = await service['getSubscriptions']();
      expect(result).toEqual({
        currentMonthSubscriptionCount: 50,
        previousMonthSubscriptionCount: 40,
        percentageDifference: '25.00%',
      });
    });
  });

  describe('getStatistics', () => {
    it('should return dashboard statistics', async () => {
      jest.spyOn(service, 'getRevenue').mockResolvedValue({
        message: SYS_MSG.REVENUE_FETCHED_SUCCESSFULLY,
        data: {
          totalRevenueCurrentMonth: 1000,
          totalRevenuePreviousMonth: 800,
          revenuePercentChange: '25.00%',
        },
      });

      jest.spyOn(service, 'getSubscriptions').mockResolvedValue({
        currentMonthSubscriptionCount: 50,
        previousMonthSubscriptionCount: 40,
        percentageDifference: '25.00%',
      });

      const result = await service.getStatistics();
      expect(result).toEqual({
        message: SYS_MSG.DASHBOARD_FETCHED_SUCCESSFULLY,
        data: {
          revenue: {
            current_month: 1000,
            previous_month: 800,
            percentage_difference: '25.00%',
          },
          Subscriptions: {
            current_month: 50,
            previous_month: 40,
            percentage_difference: '25.00%',
          },
          orders: {
            current_month: 0,
            previous_month: 0,
            percentage_difference: '0%',
          },
          active_users: {
            current: 1,
            difference_an_hour_ago: 0,
          },
        },
      });
    });
  });

  describe('getMoMRevenue', () => {
    it('should return month-over-month revenue data', async () => {
      const mockRevenue = { revenue: '500' };

      jest.spyOn(transactionRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue(mockRevenue),
          }) as any
      );

      const result = await service.getMoMRevenue();
      expect(result.message).toBe(SYS_MSG.ANALYTICS_FETCHED_SUCCESSFULLY);
      expect(result.data).toHaveProperty('Jan');
      expect(result.data).toHaveProperty('Feb');
      // Add more expectations based on your implementation
    });
  });

  describe('getSales', () => {
    it('should return a work in progress message', async () => {
      const result = await service.getSales();
      expect(result).toEqual({
        message: SYS_MSG.WORK_IN_PROGRESS,
      });
    });
  });
});
