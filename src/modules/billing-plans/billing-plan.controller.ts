import { Body, Controller, Delete, Get, Param, Patch, Post, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BillingPlanService } from './billing-plan.service';
import { skipAuth } from 'src/helpers/skipAuth';

@ApiBearerAuth()
@ApiTags('Billing Plans')
@Controller('billing-plans')
export class BillingPlanController {
  constructor(private readonly billingPlanService: BillingPlanService) {}

  @skipAuth()
  @Post('/')
  async createBillingPlan(q) {
    return this.billingPlanService.createBillingPlan();
  }
  @skipAuth()
  @Get('/')
  async getAllBillingPlans() {
    return this.billingPlanService.getAllBillingPlans();
  }
}
