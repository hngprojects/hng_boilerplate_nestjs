import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../entities/user.entity';
import { Revenue } from '../entities/revenue.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Revenue)
    private revenueRepository: Repository<Revenue>
  ) {}

  async getSummary() {
    try {
      this.logger.log('Fetching summary data');

      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({ where: { is_active: true } });
      const newUsers = await this.userRepository.count({
        where: { created_at: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) },
      });
      const totalRevenue = await this.revenueRepository
        .createQueryBuilder('revenue')
        .select('SUM(revenue.amount)', 'sum')
        .getRawOne();

      if (!totalUsers && !activeUsers && !newUsers && !totalRevenue) {
        throw new NotFoundException('Summary data not found');
      }

      return {
        total_users: totalUsers,
        active_users: activeUsers,
        new_users: newUsers,
        total_revenue: totalRevenue.sum,
      };
    } catch (error) {
      this.logger.error('Failed to fetch summary data', error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch summary data');
    }
  }

  async getLineChartData() {
    try {
      const rawData = await this.revenueRepository
        .createQueryBuilder('revenue')
        .select("DATE_TRUNC('month', revenue.createdAt) AS month, SUM(revenue.amount) AS total")
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      const labels = rawData.map(data => data.month);
      const data = rawData.map(data => data.total);

      return {
        labels,
        data,
      };
    } catch (error) {
      throw new Error('Failed to fetch line chart data: ' + error.message);
    }
  }

  async getBarChartData() {
    try {
      const rawData = await this.userRepository
        .createQueryBuilder('user')
        .select('user.is_active, COUNT(user.id) AS count')
        .groupBy('user.is_active')
        .getRawMany();

      const categories = rawData.map(data => (data.is_active ? 'Active Users' : 'Inactive Users'));
      const data = rawData.map(data => data.count);

      return {
        categories,
        data,
      };
    } catch (error) {
      throw new Error('Failed to fetch bar chart data: ' + error.message);
    }
  }

  async getPieChartData() {
    try {
      const rawData = await this.userRepository
        .createQueryBuilder('user')
        .select("DATE_TRUNC('month', user.created_at) AS month, COUNT(user.id) AS count")
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      const segments = rawData.map(data => data.month);
      const values = rawData.map(data => data.count);

      return {
        segments,
        values,
      };
    } catch (error) {
      throw new Error('Failed to fetch pie chart data: ' + error.message);
    }
  }

  async getAreaChartData() {
    try {
      const rawData = await this.revenueRepository
        .createQueryBuilder('revenue')
        .select("DATE_TRUNC('month', revenue.createdAt) AS month, SUM(revenue.amount) AS total")
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      const labels = rawData.map(data => data.month);
      const data = rawData.map(data => data.total);

      return {
        labels,
        data,
      };
    } catch (error) {
      throw new Error('Failed to fetch area chart data: ' + error.message);
    }
  }

  async getScatterPlotData() {
    try {
      const rawData = await this.userRepository
        .createQueryBuilder('user')
        .select("DATE_TRUNC('month', user.created_at) AS month, COUNT(user.id) AS count")
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      const labels = rawData.map(data => data.month);
      const data = rawData.map(data => data.count);

      return {
        labels,
        data,
      };
    } catch (error) {
      throw new Error('Failed to fetch scatter plot data: ' + error.message);
    }
  }
}
