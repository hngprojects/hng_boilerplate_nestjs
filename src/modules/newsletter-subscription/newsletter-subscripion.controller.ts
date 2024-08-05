import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

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
    return this.newsletterSubscriptionService.newsletterSubcription(createNewsletterDto);
  }

  @UseGuards(SuperAdminGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all subscribers to newsletter' })
  @ApiResponse({ status: 200, type: [Object] })
  findAll() {
    return this.newsletterSubscriptionService.findAll();
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', required: true, description: 'ID of the subscriber to be deleted' })
  @ApiOperation({ summary: 'Remove subscriber from newsletter' })
  @ApiResponse({ status: 200, description: 'Subscriber with ID {id} has been soft deleted' })
  @ApiResponse({ status: 404, description: 'Subscriber with ID ${id} not found' })
  remove(@Param('id') id: string) {
    return this.newsletterSubscriptionService.remove(id);
  }

  @UseGuards(SuperAdminGuard)
  @Get('deleted')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all deleted subscribers' })
  @ApiResponse({ status: 200, type: [Object] })
  findSoftDeleted() {
    return this.newsletterSubscriptionService.findSoftDeleted();
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
