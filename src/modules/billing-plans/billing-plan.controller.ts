import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Patch,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { BillingPlanService } from './billing-plan.service';
import { skipAuth } from '../../helpers/skipAuth';
import { BillingPlanDto } from './dto/billing-plan.dto';
import {
  createBillingPlanDocs,
  deleteBillingPlan,
  getAllBillingPlansDocs,
  getSingleBillingPlan,
  updateBillingPlan,
} from './docs/billing-plan-docs';
import { UpdateBillingPlanDto } from './dto/update-billing-plan.dto';

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

  @UseGuards(SuperAdminGuard)
  @updateBillingPlan()
  @Patch('/:id')
  async updateBillingPlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBillingPlanDto: UpdateBillingPlanDto
  ) {
    return this.billingPlanService.updateBillingPlan(id, updateBillingPlanDto);
  }

  @UseGuards(SuperAdminGuard)
  @deleteBillingPlan()
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBillingPlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingPlanService.deleteBillingPlan(id);
  }
}
