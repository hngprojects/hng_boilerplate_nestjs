import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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

    const billingPlans = await this.billingPlanRepository.find();

    if (billingPlans.length > 0) {
      return {
        status_code: HttpStatus.OK,
        status: 200,
        message: 'Billing plans already exist in the database',
      };
    }

    const res = await this.billingPlanRepository.save([freePlan, basicPlan, advancedPlan, premiumPlan]);

    return { message: 'Billing plans created successfully', data: res };
  }

  async getAllBillingPlans() {
    const allPlans = await this.billingPlanRepository.find();

    if (!allPlans.length) {
      throw new NotFoundException('No billing plans found');
    }

    return { message: 'Billing plans retrieved successfully', data: allPlans };
  }
}
