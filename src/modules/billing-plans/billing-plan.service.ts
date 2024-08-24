import { Injectable, HttpStatus, HttpException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BillingPlan } from './entities/billing-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BillingPlanDto } from './dto/billing-plan.dto';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { BillingPlanMapper } from './mapper/billing-plan.mapper';
import { UpdateBillingPlanDto } from './dto/update-billing-plan.dto';

@Injectable()
export class BillingPlanService {
  constructor(
    @InjectRepository(BillingPlan)
    private readonly billingPlanRepository: Repository<BillingPlan>
  ) {}

  async createBillingPlan(createBillingPlanDto: BillingPlanDto) {
    const billingPlan = await this.billingPlanRepository.findOne({
      where: {
        name: createBillingPlanDto.name,
      },
    });

    if (billingPlan) {
      throw new CustomHttpException(SYS_MSG.BILLING_PLAN_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const newPlan = this.billingPlanRepository.create(createBillingPlanDto);
    const createdPlan = await this.billingPlanRepository.save(newPlan);
    const plan = BillingPlanMapper.mapToResponseFormat(createdPlan);

    return {
      message: SYS_MSG.BILLING_PLAN_CREATED,
      data: plan,
    };
  }

  async getAllBillingPlans() {
    const allPlans = await this.billingPlanRepository.find();
    if (allPlans.length === 0) {
      throw new NotFoundException('No billing plans found');
    }
    const plans = allPlans.map(plan => BillingPlanMapper.mapToResponseFormat(plan));

    return {
      message: 'Billing plans retrieved successfully',
      data: plans,
    };
  }

  async getSingleBillingPlan(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid billing plan ID');
    }
    const billingPlan = await this.billingPlanRepository.findOneBy({ id });

    if (!billingPlan) {
      throw new NotFoundException('Billing plan not found');
    }
    const plan = BillingPlanMapper.mapToResponseFormat(billingPlan);
    return {
      message: 'Billing plan retrieved successfully',
      data: plan,
    };
  }

  async updateBillingPlan(id: string, updateBillingPlanDto: UpdateBillingPlanDto): Promise<BillingPlan> {
    const billing_plan = await this.billingPlanRepository.findOneBy({ id });
    if (!billing_plan) {
      throw new CustomHttpException(SYS_MSG.BILLING_PLAN_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    Object.assign(billing_plan, updateBillingPlanDto);
    return await this.billingPlanRepository.save(billing_plan);
  }

  async deleteBillingPlan(id: string): Promise<void> {
    const billing_plan = await this.billingPlanRepository.findOne({ where: { id: id } });
    if (!billing_plan) {
      throw new CustomHttpException(SYS_MSG.BILLING_PLAN_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.billingPlanRepository.delete(id);
  }
}
