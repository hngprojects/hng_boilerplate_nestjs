import { BadRequestException, Injectable } from '@nestjs/common';
import { ContactUsResponse, CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  async contactUs(createContactDto: CreateContactDto) {
    try {
      // TODO: Use Email Service to send mail to specified address

      // Just a place holder for now
      return {
        message: 'Inquiry was successfully sent',
        status: 200,
      };
    } catch (error) {
      console.log({ error });

      throw new BadRequestException({
        message: error?.message || 'A server error occurred',
        status: error?.status || 500,
      });
    }
  }
}
