import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { GetRevenueResponseDto } from './dto/get-revenue-response.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>
  ) {}

  async getRevenue(): Promise<GetRevenueResponseDto> {
    const currentMonth = new Date();
    const previousMonth = new Date();

    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const currentMonthRevenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'revenue')
      .where(
        'EXTRACT(MONTH FROM transaction.date::timestamp)= :month AND EXTRACT(YEAR FROM transaction.date::timestamp)= :year',
        {
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear(),
        }
      )
      .getRawOne();

    const previousMonthRevenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'revenue')
      .where(
        'EXTRACT(MONTH FROM transaction.date::timestamp)= :month AND EXTRACT(YEAR FROM transaction.date::timestamp)= :year',
        {
          month: previousMonth.getMonth() + 1,
          year: previousMonth.getFullYear(),
        }
      )
      .getRawOne();

    const previousRevenue = previousMonthRevenue.revenue || 0;
    const currentRevenue = currentMonthRevenue.revenue || 0;

    const revenuePercentChange =
      previousRevenue === 0
        ? '100.00%'
        : (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(2) + '%';

    return {
      message: SYS_MSG.REVENUE_FETCHED_SUCCESSFULLY,
      data: {
        totalRevenueCurrentMonth: currentMonthRevenue.revenue,
        revenuePercentChange,
      },
    };
  }
}
