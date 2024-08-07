import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { NewsletterSubscriptionResponseDto } from './dto/newsletter-subscription.response.dto';

@ApiTags('Newsletter Subscription')
@Controller('newsletter-subscription')
export class NewsletterSubscriptionController {
  constructor(private readonly newsletterSubscriptionService: NewsletterSubscriptionService) {}

  @skipAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 201, description: 'Subscriber subscription successful.' })
  create(@Body() createNewsletterDto: CreateNewsletterSubscriptionDto) {
    return this.newsletterSubscriptionService.newsletterSubscription(createNewsletterDto);
  }

  @UseGuards(SuperAdminGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all subscribers to newsletter' })
  @ApiResponse({
    status: 200,
    description: 'Return all team members',
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
  async getAllSubscribers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ message: string; data: NewsletterSubscriptionResponseDto[]; meta: any }> {
    const { subscribers, total } = await this.newsletterSubscriptionService.findAllSubscribers(page, limit);
    return {
      message: 'Subscribers list fetched successfully',
      data: subscribers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', required: true, description: 'ID of the subscriber to be deleted' })
  @ApiOperation({ summary: 'Remove subscriber from newsletter' })
  @ApiResponse({ status: 200, description: 'Subscriber with ID {id} has been soft deleted' })
  @ApiResponse({ status: 404, description: 'Subscriber with ID ${id} not found' })
  removeSubscriber(@Param('id') id: string) {
    return this.newsletterSubscriptionService.removeSubscriber(id);
  }

  @UseGuards(SuperAdminGuard)
  @Get('deleted')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all deleted subscribers' })
  @ApiResponse({
    status: 200,
    description: 'Return all team members',
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
  async findSoftDeleted(): Promise<{ message: string; data: NewsletterSubscriptionResponseDto[] }> {
    const deletedSubscribers = await this.newsletterSubscriptionService.findSoftDeleted();

    return {
      message: 'Deleted subscribers list fetched successfully',
      data: deletedSubscribers,
    };
  }

  @UseGuards(SuperAdminGuard)
  @Post('restore/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all deleted subscribers' })
  @ApiResponse({ status: 200, description: 'Subscriber with ID {id} has been restored' })
  @ApiResponse({ status: 404, description: 'Subscriber with ID ${id} not found or already restored' })
  restore(@Param('id') id: string) {
    return this.newsletterSubscriptionService.restore(id);
  }
}
