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
  Query
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillingPlanService } from './billing-plan.service';
import {
  createBillingPlanDocs,
  deleteBillingPlanDocs,
  getAllBillingPlansDocs,
  getSingleBillingPlanDocs,
  updateBillingPlanDocs,
} from './docs/billing-plan-docs';
import { SuperAdminGuard } from '@guards/super-admin.guard';
import { BillingPlanDto } from './dto/billing-plan.dto';
import { skipAuth } from '@shared/helpers/skipAuth';
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
  async getAllBillingPlans(
    @Query('page') page: string,
    @Query('limit') limit: string, 
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10; 

    return this.billingPlanService.getAllBillingPlans(pageNumber, limitNumber);
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
}
