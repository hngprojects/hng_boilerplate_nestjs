import { validate } from 'class-validator';
import { BillingPlanDto } from'../../src/modules/billing-plans/dto/billing-plan.dto';


describe('BillingPlanDto Validation', () => {
  it('✅ should pass with valid data', async () => {
    const dto = new BillingPlanDto();
    dto.name = 'Premium Plan';
    dto.description = 'Best plan for yearly subscribers';
    dto.frequency = 'yearly';
    dto.amount = 1200;
    dto.is_active = true;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('❌ should fail if frequency is not "monthly" or "yearly"', async () => {
    const dto = new BillingPlanDto();
    dto.name = 'Basic Plan';
    dto.frequency = 'weekly'; // ❌ Invalid frequency
    dto.amount = 100;
    dto.is_active = true;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
        'isIn',
        'frequency must be one of the following values: monthly, yearly',
      );      
  });

  it('❌ should fail if amount is not a number', async () => {
    const dto = new BillingPlanDto();
    dto.name = 'Basic Plan';
    dto.frequency = 'monthly';
    dto.amount = 'not-a-number' as any; // ❌ Invalid amount
    dto.is_active = true;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('✅ should allow optional description', async () => {
    const dto = new BillingPlanDto();
    dto.name = 'Basic Plan';
    dto.frequency = 'monthly';
    dto.amount = 100;
    dto.is_active = true; // No description provided

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('❌ should fail if is_active is not a boolean', async () => {
    const dto = new BillingPlanDto();
    dto.name = 'Basic Plan';
    dto.frequency = 'monthly';
    dto.amount = 100;
    dto.is_active = 'yes' as any; // ❌ Invalid boolean

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
  });
});
