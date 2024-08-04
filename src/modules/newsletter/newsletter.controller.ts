import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { skipAuth } from '../../helpers/skipAuth';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@skipAuth()
@ApiTags('Newsletter Subscription')
@Controller('newsletter-subscription')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 201, description: 'Newsletter subscription successful.' })
  create(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newsletterService.newsletterSubcription(createNewsletterDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all subscribers to newsletter' })
  @ApiResponse({ status: 200, type: [Object] })
  findAll() {
    return this.newsletterService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', required: true, description: 'ID of the subscriber to be deleted' })
  @ApiOperation({ summary: 'Remove subscriber from newsletter' })
  @ApiResponse({ status: 200, description: 'Newsletter with ID {id} has been soft deleted' })
  @ApiResponse({ status: 404, description: 'Newsletter with ID ${id} not found' })
  remove(@Param('id') id: string) {
    return this.newsletterService.remove(id);
  }

  @Get('deleted')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all deleted subscribers' })
  @ApiResponse({ status: 200, type: [Object] })
  findSoftDeleted() {
    return this.newsletterService.findSoftDeleted();
  }

  @Post('restore/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all deleted subscribers' })
  @ApiResponse({ status: 200, description: 'Newsletter with ID {id} has been restored' })
  @ApiResponse({ status: 404, description: 'Newsletter with ID ${id} not found or already restored' })
  restore(@Param('id') id: string) {
    return this.newsletterService.restore(id);
  }
}
