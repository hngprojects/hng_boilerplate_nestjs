import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactDto } from '../contact-us/dto/create-contact-us.dto';
import { ApiTags } from '@nestjs/swagger';
import { createContactDocs } from './docs/contact-us-swagger.docs';
import { skipAuth } from '@shared/helpers/skipAuth';

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
