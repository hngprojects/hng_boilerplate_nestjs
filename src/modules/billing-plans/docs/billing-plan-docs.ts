import { applyDecorators } from '@nestjs/common';
import { BillingPlanDto } from '../dto/billing-plan.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingPlan } from '../entities/billing-plan.entity';

export function createBillingPlanDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create billing plans' }),
    ApiBody({ type: BillingPlanDto }),
    ApiResponse({ status: 201, description: 'Billing plan created successfully.', type: BillingPlanDto }),
    ApiResponse({ status: 200, description: 'Billing plan already exists in the database.', type: [BillingPlanDto] })
  );
}

export function getAllBillingPlansDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all billing plans' }),
    ApiResponse({ status: 200, description: 'Billing plans retrieved successfully.', type: [BillingPlanDto] }),
    ApiResponse({ status: 404, description: 'No billing plans found.' })
  );
}

export function getSingleBillingPlanDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get single billing plan by ID' }),
    ApiResponse({ status: 200, description: 'Billing plan retrieved successfully', type: BillingPlanDto }),
    ApiResponse({ status: 400, description: 'Invalid billing plan ID' }),
    ApiResponse({ status: 404, description: 'Billing plan not found' })
  );
}

export function updateBillingPlanDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a billing plan by ID' }),
    ApiResponse({ status: 200, description: 'Billing plan updated successfully.', type: BillingPlan }),
    ApiResponse({ status: 404, description: 'Billing plan not found.' })
  );
}

export function deleteBillingPlanDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a billing plan by ID' }),
    ApiResponse({ status: 204, description: 'Billing plan deleted successfully.' }),
    ApiResponse({ status: 404, description: 'Billing plan not found.' })
  );
}
