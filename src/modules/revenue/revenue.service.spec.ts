import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetRevenueResponseDto } from './dto/get-revenue-response.dto';
import { Transaction } from './entities/transaction.entity';
import { RevenueService } from './revenue.service';

describe('RevenueService', () => {
  let service: RevenueService;
  let repository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
    repository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  it('should return revenue data', async () => {
    const currentMonthRevenue = { revenue: 1000 };
    const previousMonthRevenue = { revenue: 800 };

    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValueOnce(currentMonthRevenue).mockResolvedValueOnce(previousMonthRevenue),
    };

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

    const result: GetRevenueResponseDto = await service.getRevenue();

    expect(result).toEqual({
      message: 'Revenue Fetched',
      data: {
        totalRevenueCurrentMonth: currentMonthRevenue.revenue,
        revenuePercentChange: '25.00%',
      },
    });
  });

  it('should handle zero previous month revenue', async () => {
    const currentMonthRevenue = { revenue: 1000 };
    const previousMonthRevenue = { revenue: 0 };

    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValueOnce(currentMonthRevenue).mockResolvedValueOnce(previousMonthRevenue),
    };

    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

    const result: GetRevenueResponseDto = await service.getRevenue();

    expect(result).toEqual({
      message: 'Revenue Fetched',
      data: {
        totalRevenueCurrentMonth: currentMonthRevenue.revenue,
        revenuePercentChange: '100.00%',
      },
    });
  });
});
