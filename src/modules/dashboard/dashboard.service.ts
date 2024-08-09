import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { NewsletterSubscription } from '../newsletter-subscription/entities/newsletter-subscription.entity';
import { GetRevenueResponseDto } from './dto/get-revenue-response.dto';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { GetSubscriptionCountDto } from './dto/get-subscription-count.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class DashboardService {
  private currentMonth: Date;
  private previousMonth: Date;
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(NewsletterSubscription)
    private readonly newsletterSubscriptionRepository: Repository<NewsletterSubscription>
  ) {
    this.currentMonth = new Date();
    this.previousMonth = new Date();

    this.previousMonth.setMonth(this.previousMonth.getMonth() - 1);
  }

  getPercentageDifference(currentValue: number, previousValue: number): string {
    return previousValue === 0 ? '100.00%' : (((currentValue - previousValue) / previousValue) * 100).toFixed(2) + '%';
  }

  async getRevenue(): Promise<GetRevenueResponseDto> {
    const currentMonthRevenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'revenue')
      .where(
        'EXTRACT(MONTH FROM transaction.date::timestamp)= :month AND EXTRACT(YEAR FROM transaction.date::timestamp)= :year',
        {
          month: this.currentMonth.getMonth() + 1,
          year: this.currentMonth.getFullYear(),
        }
      )
      .getRawOne();

    const previousMonthRevenue = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'revenue')
      .where(
        'EXTRACT(MONTH FROM transaction.date::timestamp)= :month AND EXTRACT(YEAR FROM transaction.date::timestamp)= :year',
        {
          month: this.previousMonth.getMonth() + 1,
          year: this.previousMonth.getFullYear(),
        }
      )
      .getRawOne();

    const previousRevenue = previousMonthRevenue.revenue || 0;
    const currentRevenue = currentMonthRevenue.revenue || 0;

    const revenuePercentChange = this.getPercentageDifference(currentRevenue, previousRevenue);

    return {
      message: SYS_MSG.REVENUE_FETCHED_SUCCESSFULLY,
      data: {
        totalRevenueCurrentMonth: currentMonthRevenue.revenue,
        totalRevenuePreviousMonth: previousMonthRevenue.revenue,
        revenuePercentChange,
      },
    };
  }

  async getSubscriptions(): Promise<GetSubscriptionCountDto> {
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const startOfNextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);

    const [, currentMonthSubscriptionCount] = await this.newsletterSubscriptionRepository.findAndCount({
      where: {
        deletedAt: null,
        updated_at: Between(startOfMonth, startOfNextMonth),
      },
    });

    const [, previousMonthSubscriptionCount] = await this.newsletterSubscriptionRepository.findAndCount({
      where: {
        deletedAt: null,
        updated_at: Between(this.previousMonth, startOfMonth),
      },
    });

    const percentageDifference = this.getPercentageDifference(
      currentMonthSubscriptionCount,
      previousMonthSubscriptionCount
    );

    return {
      currentMonthSubscriptionCount,
      previousMonthSubscriptionCount,
      percentageDifference,
    };
  }

  async getStatistics(): Promise<GetStatisticsDto> {
    const revenueStats = await this.getRevenue();
    const subscriptionsCount = await this.getSubscriptions();

    // TODO: Implement the logic to return the dashboard metric for Orders and Active users
    return {
      message: SYS_MSG.DASHBOARD_FETCHED_SUCCESSFULLY,
      data: {
        revenue: {
          current_month: revenueStats.data.totalRevenueCurrentMonth,
          previous_month: revenueStats.data.totalRevenuePreviousMonth,
          percentage_difference: revenueStats.data.revenuePercentChange,
        },
        Subscriptions: {
          current_month: subscriptionsCount.currentMonthSubscriptionCount || 0,
          previous_month: subscriptionsCount.previousMonthSubscriptionCount || 0,
          percentage_difference: subscriptionsCount.percentageDifference || '0%',
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
    };
  }

  async getMoMRevenue(): Promise<any> {
    const year = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const revenueData = {};

    for (let i = 0; i < months.length; i++) {
      const month = i + 1;
      const monthRevenue = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'revenue')
        .where(
          'EXTRACT(MONTH FROM transaction.date::timestamp) = :month AND EXTRACT(YEAR FROM transaction.date::timestamp) = :year',
          {
            month,
            year,
          }
        )
        .getRawOne();

      revenueData[months[i]] = monthRevenue?.revenue || 0;
    }

    return { message: SYS_MSG.ANALYTICS_FETCHED_SUCCESSFULLY, data: revenueData };
  }

  async getSales(): Promise<{ message: string }> {
    return {
      message: SYS_MSG.WORK_IN_PROGRESS,
    };
  }
}
