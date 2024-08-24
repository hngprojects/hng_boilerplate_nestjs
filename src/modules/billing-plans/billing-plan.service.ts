import { Injectable, HttpStatus, HttpException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BillingPlan } from './entities/billing-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BillingPlanDto } from "./dto/billing-plan.dto";
import * as SYS_MSG from "../../helpers/SystemMessages";
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { BillingPlanMapper } from './mapper/billing-plan.mapper';
 
@Injectable()
export class BillingPlanService {
  constructor(
    @InjectRepository(BillingPlan)
    private readonly billingPlanRepository: Repository<BillingPlan>
  ) {}

  async createBillingPlan(createBillingPlanDto: BillingPlanDto  ) {
    const billingPlan = await this.billingPlanRepository.findOne({
      where: {
        name: createBillingPlanDto.name
      }
    });

    if (!billingPlan) {
      throw new CustomHttpException(SYS_MSG.BILLING_PLAN_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const newPlan = this.billingPlanRepository.create(createBillingPlanDto);
    const createdPlan = await this.billingPlanRepository.save(newPlan);
    const plan = BillingPlanMapper.mapToResponseFormat(createdPlan)

    return {
      message: SYS_MSG.BILLING_PLAN_CREATED,
      data: plan,
    };
  }

  async getAllBillingPlans() {
    try {
      const allPlans = await this.billingPlanRepository.find();

      if (allPlans.length === 0) {
        throw new NotFoundException('No billing plans found');
      }

      const plans = allPlans.map(plan => BillingPlanMapper.mapToResponseFormat(plan));

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

      const plan = BillingPlanMapper.mapToResponseFormat(billingPlan);

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

}
