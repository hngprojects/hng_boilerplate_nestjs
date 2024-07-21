import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { SubscriptionPlansService } from './subscription_plans.service';
import { CreateSubscriptionPlanDto } from 'src/subscription_plans/dto/create-subscription_plan.dto.ts;

@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

  @Post()
  create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlansService.create(createSubscriptionPlanDto);
  }
}
