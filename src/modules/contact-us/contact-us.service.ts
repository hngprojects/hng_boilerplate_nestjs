import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from '../contact-us/dto/create-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private contactRepository: Repository<ContactUs>,
    private readonly mailerService: MailerService
  ) {}

  async createContactMessage(createContactDto: CreateContactDto) {
    const contact = this.contactRepository.create(createContactDto);
    await this.contactRepository.save(contact);

    try {
      await this.sendEmail(createContactDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }

    return { message: 'Inquiry sent successfully', status_code: 200 };
  }

  private async sendEmail(contactDto: CreateContactDto) {
    await this.mailerService.sendMail({
      to: 'amal_salam@yahoo.com',
      subject: 'New Contact Inquiry',
      template: 'contact-inquiry',
      context: {
        name: contactDto.name,
        email: contactDto.email,
        message: contactDto.message,
        date: new Date().toLocaleString(),
      },
    });
  }
}
