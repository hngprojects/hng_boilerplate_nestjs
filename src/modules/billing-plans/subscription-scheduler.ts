import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BillingPlanService } from './billing-plan.service';

@Injectable()
export class SubscriptionScheduler {
  constructor(private readonly billingPlanService: BillingPlanService) {}

  @Cron('0 0 * * *')
  async handleCron() {
    console.log('Running daily subscription renewal reminder job');
    const subscriptions = await this.billingPlanService.getAllSubscriptions();
    for (const subscription of subscriptions) {
      await this.billingPlanService.sendRenewalReminder(subscription.id);
    }
  }
}
