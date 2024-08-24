import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactDto } from '../contact-us/dto/create-contact-us.dto';
import { ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../..//helpers/skipAuth';
import { createContactDocs } from './docs/contact-us-swagger.docs';

@ApiTags('Contact Us')
@skipAuth()
@Controller('contact')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @skipAuth()
  @HttpCode(HttpStatus.CREATED)
  @createContactDocs()
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactUsService.createContactMessage(createContactDto);
  }
}
