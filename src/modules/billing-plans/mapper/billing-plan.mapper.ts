import { BillingPlan } from "../entities/billing-plan.entity";

export class BillingPlanMapper {
  static mapToResponseFormat(billingPlan: BillingPlan) {
    if (!billingPlan) {
      throw new Error('Billing plan entity is required');
    }

    return {
      id: billingPlan.id,
      name: billingPlan.name,
      amount: billingPlan.amount,
      frequency: billingPlan.frequency,
      is_active: billingPlan.is_active
    };
  }
}