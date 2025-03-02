import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsletterSubscriptionResponseDto } from '../dto/newsletter-subscription.response.dto';
import { BadRequestResponseDto } from '../dto/bad-request-response.dto';
import { NotFoundResponseDto } from '../dto/not-found-response.dto';
import { AlreadySubscribedResponseDto } from '../dto/already-subscribed-response.dto';

export function createNewsletterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Subscribe to newsletter' }),
    ApiResponse({
      status: 201,
      description: 'Subscriber subscription successful.',
      type: NewsletterSubscriptionResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestResponseDto })
  );
}

export function resubscribeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Resubscribe to the newsletter' }),
    ApiResponse({
      status: 200,
      description: 'User successfully resubscribed.',
      type: NewsletterSubscriptionResponseDto,
    }),
    ApiResponse({ status: 400, description: 'User is already subscribed.', type: AlreadySubscribedResponseDto }),
    ApiResponse({ status: 404, description: 'User not found or not unsubscribed.', type: NotFoundResponseDto })
  );
}

export function getAllSubscribersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Fetch all subscribers to newsletter' }),
    ApiResponse({
      status: 200,
      description: 'Return all subscribers',
      schema: {
        properties: {
          status: { type: 'string' },
          message: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/NewsletterSubscriptionResponseDto' },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
    })
  );
}

export function removeSubscriberDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove subscriber from newsletter' }),
    ApiResponse({ status: 200, description: 'Subscriber with ID {id} has been soft deleted' }),
    ApiResponse({ status: 404, description: 'Subscriber with ID ${id} not found', type: NotFoundResponseDto })
  );
}

export function findSoftDeletedDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Fetch all deleted subscribers' }),
    ApiResponse({
      status: 200,
      description: 'Return all deleted subscribers',
      schema: {
        properties: {
          status: { type: 'string' },
          message: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/NewsletterSubscriptionResponseDto' },
          },
        },
      },
    })
  );
}

export function restoreDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Restore a deleted subscriber' }),
    ApiResponse({ status: 200, description: 'Subscriber with ID {id} has been restored' }),
    ApiResponse({
      status: 404,
      description: 'Subscriber with ID ${id} not found or already restored',
      type: NotFoundResponseDto,
    })
  );
}

export function unsubscribeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Unsubscribe from the newsletter' }),
    ApiResponse({ status: 200, description: 'User has been unsubscribed successfully.' }),
    ApiResponse({ status: 404, description: 'Email not found', type: NotFoundResponseDto })
  );
}
