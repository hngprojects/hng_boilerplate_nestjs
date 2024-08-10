import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistResponseDto } from './dto/create-waitlist-response.dto';
import { validate } from 'class-validator';
import { CustomHttpException } from '../../helpers/custom-http-filter';

@Injectable()
export default class WaitlistService {
  constructor(
    @InjectRepository(Waitlist) private readonly waitlistRepository: Repository<Waitlist>,
    private mailerService: MailerService
  ) {}

  async createWaitlist(createWaitlistDto: CreateWaitlistDto): Promise<WaitlistResponseDto> {
    const errors = await validate(createWaitlistDto);
    if (errors.length > 0) {
      console.log('here');
      const messages = errors.map(err => Object.values(err.constraints)).flat();
      throw new CustomHttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: messages,
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const { full_name, email } = createWaitlistDto;

    const url_slug = full_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const waitlist = this.waitlistRepository.create({
      name: full_name,
      email,
      status: false,
      url_slug,
    });

    await this.waitlistRepository.save(waitlist);

    const template = `<p>Hello {{recipientName}},</p><p>Thank you for signing up for our waitlist! We will notify you once you are selected.</p>`;

    const personalizedContent = template.replace('{{recipientName}}', full_name);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Waitlist Confirmation',
      html: personalizedContent,
    });

    return {
      message: 'You are all signed up!',
    };
  }

  async getAllWaitlist() {
    const waitlist = await this.waitlistRepository.find();
    return {
      status_code: HttpStatus.OK,
      status: HttpStatus.OK,
      message: 'Added to waitlist',
      data: {
        waitlist,
      },
    };
  }
}
