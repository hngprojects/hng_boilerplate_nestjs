import { Injectable, HttpStatus, HttpException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BillingPlan } from './entities/billing-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BillingPlanService {
  constructor(
    @InjectRepository(BillingPlan)
    private readonly billingPlanRepository: Repository<BillingPlan>
  ) {}

  async createBillingPlan() {
    try {
      const billingPlans = await this.billingPlanRepository.find();

      if (billingPlans.length > 0) {
        const plans = billingPlans.map(plan => ({ id: plan.id, name: plan.name, price: plan.price }));

        return {
          status_code: HttpStatus.OK,
          message: 'Billing plans already exist in the database',
          data: plans,
        };
      }

      const newPlans = this.createBillingPlanEntities();
      const createdPlans = await this.billingPlanRepository.save(newPlans);
      const plans = createdPlans.map(plan => ({ id: plan.id, name: plan.name, price: plan.price }));

      return {
        message: 'Billing plans created successfully',
        data: plans,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: `Internal server error: ${error.message}`,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllBillingPlans() {
    try {
      const allPlans = await this.billingPlanRepository.find();

      if (allPlans.length === 0) {
        throw new NotFoundException('No billing plans found');
      }

      const plans = allPlans.map(plan => ({ id: plan.id, name: plan.name, price: plan.price }));

      return {
        message: 'Billing plans retrieved successfully',
        data: plans,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Internal server error: ${error.message}`,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSingleBillingPlan(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('Invalid billing plan ID');
      }

      const billingPlan = await this.billingPlanRepository.findOneBy({ id });

      if (!billingPlan) {
        throw new NotFoundException('Billing plan not found');
      }

      const plan = { id: billingPlan.id, name: billingPlan.name, price: billingPlan.price };

      return {
        message: 'Billing plan retrieved successfully',
        data: plan,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Internal server error: ${error.message}`,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private createBillingPlanEntities() {
    const freePlan = this.billingPlanRepository.create({
      name: 'Free',
      price: 0,
    });
    const basicPlan = this.billingPlanRepository.create({
      name: 'Basic',
      price: 20,
    });
    const advancedPlan = this.billingPlanRepository.create({
      name: 'Advanced',
      price: 50,
    });
    const premiumPlan = this.billingPlanRepository.create({
      name: 'Premium',
      price: 100,
    });

    return [freePlan, basicPlan, advancedPlan, premiumPlan];
  }
}
