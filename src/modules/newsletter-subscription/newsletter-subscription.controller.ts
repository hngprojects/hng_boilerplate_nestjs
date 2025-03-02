import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { skipAuth } from '@shared/helpers/skipAuth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NewsletterSubscriptionResponseDto } from './dto/newsletter-subscription.response.dto';
import { SuperAdminGuard } from '@guards/super-admin.guard';
import { UnsubscribeNewsletterDto } from './dto/unsubscribe-newsletter.dto';
import { ResubscribeNewsletterDto } from './dto/resubscribe-newsletter.dto';
import {
  createNewsletterDocs,
  getAllSubscribersDocs,
  resubscribeDocs,
  removeSubscriberDocs,
  findSoftDeletedDocs,
  restoreDocs,
  unsubscribeDocs,
} from './docs/newsletter-subscription-swagger.docs';

@ApiTags('Newsletter Subscription')
@Controller('newsletter-subscription')
export class NewsletterSubscriptionController {
  constructor(private readonly newsletterSubscriptionService: NewsletterSubscriptionService) {}

  @skipAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @createNewsletterDocs()
  create(@Body() createNewsletterDto: CreateNewsletterSubscriptionDto) {
    return this.newsletterSubscriptionService.newsletterSubscription(createNewsletterDto);
  }

  @skipAuth()
  @Post('resubscribe')
  @HttpCode(HttpStatus.OK)
  @resubscribeDocs()
  resubscribe(@Body() resubscribeDto: ResubscribeNewsletterDto) {
    return this.newsletterSubscriptionService.resubscribe(resubscribeDto);
  }

  @ApiBearerAuth()
  @UseGuards(SuperAdminGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @getAllSubscribersDocs()
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

  @ApiBearerAuth()
  @UseGuards(SuperAdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @removeSubscriberDocs()
  removeSubscriber(@Param('id') id: string) {
    return this.newsletterSubscriptionService.removeSubscriber(id);
  }

  @ApiBearerAuth()
  @UseGuards(SuperAdminGuard)
  @Get('deleted')
  @HttpCode(HttpStatus.OK)
  @findSoftDeletedDocs()
  async findSoftDeleted(): Promise<{ message: string; data: NewsletterSubscriptionResponseDto[] }> {
    const deletedSubscribers = await this.newsletterSubscriptionService.findSoftDeleted();
    return {
      message: 'Deleted subscribers list fetched successfully',
      data: deletedSubscribers,
    };
  }

  @ApiBearerAuth()
  @UseGuards(SuperAdminGuard)
  @Post('restore/:id')
  @HttpCode(HttpStatus.OK)
  @restoreDocs()
  restore(@Param('id') id: string) {
    return this.newsletterSubscriptionService.restore(id);
  }

  @Post('unsubscribe')
  @skipAuth()
  @HttpCode(HttpStatus.OK)
  @unsubscribeDocs()
  unsubscribe(@Body() unsubscribeDto: UnsubscribeNewsletterDto) {
    return this.newsletterSubscriptionService.unsubscribe(unsubscribeDto.email);
  }
}
