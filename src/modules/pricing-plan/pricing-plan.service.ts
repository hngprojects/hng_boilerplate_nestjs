import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { Plans } from './entities/pricing-plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PricingPlanService {
  constructor(@InjectRepository(Plans) private plansRepository: Repository<Plans>) {}
  create(createPricingPlanDto: CreatePricingPlanDto) {
    return 'This action adds a new pricingPlan';
  }

  findAll() {
    return `This action returns all pricingPlan`;
  }

  async findOne(id: string) {
    try {
      if (!id) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: 'Invalid pricing plan ID',
        };
      }
      const pricePlan = this.plansRepository.findOne({ where: { id } });
      if (!pricePlan) {
        return {
          status_code: HttpStatus.NOT_FOUND,
          message: 'Pricing plan not found',
        };
      }
      return {
        status_code: HttpStatus.OK,
        message: 'Pricing plan retrieved successfully',
        data: pricePlan,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: error.message,
      };
    }
  }

  update(id: number, updatePricingPlanDto: UpdatePricingPlanDto) {
    return `This action updates a #${id} pricingPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} pricingPlan`;
  }
}
