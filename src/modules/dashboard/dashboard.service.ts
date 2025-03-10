import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as SYS_MSG from '@shared/constants/SystemMessages';
import { GetRevenueResponseDto } from './dto/get-revenue-response.dto';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { GetSubscriptionCountDto } from './dto/get-subscription-count.dto';
import { Transaction } from './entities/transaction.entity';
import { NewsletterSubscription } from '@modules/newsletter-subscription/entities/newsletter-subscription.entity';
import { User } from '@modules/user/entities/user.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class DashboardService {
  private currentMonth: Date;
  private previousMonth: Date;
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

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

  async getOrders(): Promise<any> {
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const startOfNextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    const startOfPreviousMonth = new Date(this.previousMonth.getFullYear(), this.previousMonth.getMonth(), 1);

    // Get current month orders count
    const [, currentMonthOrdersCount] = await this.orderRepository.findAndCount({
      where: {
        created_at: Between(startOfMonth, startOfNextMonth),
      },
    });

    // Get previous month orders count
    const [, previousMonthOrdersCount] = await this.orderRepository.findAndCount({
      where: {
        created_at: Between(startOfPreviousMonth, startOfMonth),
      },
    });

    const percentageDifference = this.getPercentageDifference(currentMonthOrdersCount, previousMonthOrdersCount);

    return {
      currentMonthOrdersCount,
      previousMonthOrdersCount,
      percentageDifference,
    };
  }

  async getActiveUsers(): Promise<any> {
    // Get current active users (users active in the last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const currentActiveUsersCount = await this.userRepository.count({
      where: {
        is_active: true,
        updated_at: Between(oneHourAgo, new Date()),
      },
    });

    // Get active users from two hours ago to one hour ago for comparison
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const previousHourActiveUsersCount = await this.userRepository.count({
      where: {
        is_active: true,
        updated_at: Between(twoHoursAgo, oneHourAgo),
      },
    });

    const difference = currentActiveUsersCount - previousHourActiveUsersCount;

    return {
      current: currentActiveUsersCount,
      difference_an_hour_ago: difference,
    };
  }

  async getStatistics(): Promise<GetStatisticsDto> {
    const revenueStats = await this.getRevenue();
    const subscriptionsCount = await this.getSubscriptions();
    const ordersStats = await this.getOrders();
    const activeUsersStats = await this.getActiveUsers();

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
          current_month: ordersStats.currentMonthOrdersCount || 0,
          previous_month: ordersStats.previousMonthOrdersCount || 0,
          percentage_difference: ordersStats.percentageDifference || '0%',
        },
        active_users: {
          current: activeUsersStats.current || 0,
          difference_an_hour_ago: activeUsersStats.difference_an_hour_ago || 0,
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
