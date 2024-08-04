import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { skipAuth } from '../../helpers/skipAuth';

@skipAuth()
@Controller('newsletter-subscription')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  create(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newsletterService.newsletterSubcription(createNewsletterDto);
  }

  @Get()
  findAll() {
    return this.newsletterService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsletterService.remove(id);
  }

  @Get('deleted')
  findSoftDeleted() {
    return this.newsletterService.findSoftDeleted();
  }

  @Post('restore/:id')
  restore(@Param('id') id: string) {
    return this.newsletterService.restore(id);
  }
}
