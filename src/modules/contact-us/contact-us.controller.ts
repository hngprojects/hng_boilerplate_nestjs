import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CreateContactDto } from '../contact-us/dto/create-contact-us.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { skipAuth } from '../..//helpers/skipAuth';

@ApiTags('Contact Us')
@skipAuth()
@Controller('contact')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @ApiOperation({ summary: 'Post a Contact us Message' })
  @ApiBearerAuth()
  @Post()
  @HttpCode(200)
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactUsService.createContactMessage(createContactDto);
  }
}
