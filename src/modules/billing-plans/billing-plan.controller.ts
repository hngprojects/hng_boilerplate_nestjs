import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { BillingPlanService } from './billing-plan.service';
import { skipAuth } from '../../helpers/skipAuth';
import { BillingPlanDto } from './dto/billing-plan.dto';
import { createBillingPlanDocs, getAllBillingPlansDocs, getSingleBillingPlan } from './docs/billing-plan-docs';

@ApiTags('Billing Plans')
@Controller('billing-plans')
export class BillingPlanController {
  constructor(private readonly billingPlanService: BillingPlanService) {}

  @Post('/')
  @createBillingPlanDocs()
  @UseGuards(SuperAdminGuard)
  async createBillingPlan(@Body() createBillingPlanDto: BillingPlanDto) {
    return this.billingPlanService.createBillingPlan(createBillingPlanDto);
  }

  @skipAuth()
  @getAllBillingPlansDocs()
  @Get('/')
  async getAllBillingPlans() {
    return this.billingPlanService.getAllBillingPlans();
  }

  @skipAuth()
  @getSingleBillingPlan()
  @Get('/:id')
  async getSingleBillingPlan(@Param('id') id: string) {
    return this.billingPlanService.getSingleBillingPlan(id);
  }
}
