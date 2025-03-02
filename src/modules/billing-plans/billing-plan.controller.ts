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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { BillingPlanService } from './billing-plan.service';
import { skipAuth } from '@shared/helpers/skipAuth';
import { BillingPlanDto } from './dto/billing-plan.dto';
import {
  createBillingPlanDocs,
  deleteBillingPlanDocs,
  getAllBillingPlansDocs,
  getSingleBillingPlanDocs,
  updateBillingPlanDocs,
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
  @getSingleBillingPlanDocs()
  @Get('/:id')
  async getSingleBillingPlan(@Param('id') id: string) {
    return this.billingPlanService.getSingleBillingPlan(id);
  }

  @UseGuards(SuperAdminGuard)
  @updateBillingPlanDocs()
  @Patch('/:id')
  async updateBillingPlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBillingPlanDto: UpdateBillingPlanDto
  ) {
    return this.billingPlanService.updateBillingPlan(id, updateBillingPlanDto);
  }

  @UseGuards(SuperAdminGuard)
  @deleteBillingPlanDocs()
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBillingPlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingPlanService.deleteBillingPlan(id);
  }

  //  For sending renewal reminders

  @Post('send-renewal-reminder/:id')
  @ApiOperation({ summary: 'Send renewal reminder for a billing plan' })
  @ApiResponse({
    status: 200,
    description: 'Renewal reminder sent successfully.',
  })
  @ApiResponse({ status: 404, description: 'Billing plan not found' })
  async sendRenewalReminder(@Param('id') id: string) {
    return this.billingPlanService.sendRenewalReminder(id);
  }
}
