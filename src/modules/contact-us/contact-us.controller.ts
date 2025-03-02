import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactDto } from '../contact-us/dto/create-contact-us.dto';
import { ApiTags } from '@nestjs/swagger';
import { createContactDocs, getAllContactDocs } from './docs/contact-us-swagger.docs';
import { skipAuth } from '@shared/helpers/skipAuth';

@ApiTags('Contact Us')
@Controller({ path: 'contact', version: '1' })
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @skipAuth()
  @HttpCode(HttpStatus.CREATED)
  @createContactDocs()
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactUsService.createContactMessage(createContactDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @getAllContactDocs()
  async getAllContact(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.contactUsService.getAllContactMessages(page, limit);
  }
}
