import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from '../contact-us/dto/create-contact-us.dto';
import { ContactUs } from './entities/contact-us.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as CONTACTHELPER from '../../helpers/contactHelper';
import * as SYS_MSG from '../../helpers/SystemMessages';

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
    await this.sendEmail(createContactDto);
    return {
      message: SYS_MSG.INQUIRY_SENT,
      status_code: HttpStatus.CREATED,
    };
  }

  private async sendEmail(contactDto: CreateContactDto) {
    await this.mailerService.sendMail({
      to: [contactDto.email, CONTACTHELPER.COMPANYEMAIL],
      subject: CONTACTHELPER.SUBJECT,
      template: 'contact-inquiry',
      context: {
        name: contactDto.name,
        email: contactDto.email,
        phonenumber: contactDto.phone,
        message: contactDto.message,
        date: new Date().toLocaleString(),
      },
    });
  }
}
