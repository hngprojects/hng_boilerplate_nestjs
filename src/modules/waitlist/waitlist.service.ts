import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistResponseDto } from './dto/create-waitlist-response.dto';
import * as SYS_MSG from '@shared/constants/SystemMessages';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import { STATUS_CODES } from 'http';

@Injectable()
export default class WaitlistService {
  constructor(
    @InjectRepository(Waitlist) private readonly waitlistRepository: Repository<Waitlist>,
    private mailerService: MailerService
  ) {}

  async createWaitlist(createWaitlistDto: CreateWaitlistDto): Promise<WaitlistResponseDto> {
    const { full_name: name, email } = createWaitlistDto;

    const alreadyWaitlisted = await this.waitlistRepository.findOne({ where: { email } });
    if (alreadyWaitlisted) throw new CustomHttpException(SYS_MSG.USER_ALREADY_WAITLISTED, HttpStatus.CONFLICT);

    const waitlist = this.waitlistRepository.create({ name, email });
    await this.waitlistRepository.save(waitlist);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Waitlist Confirmation',
      template: 'waitlist-confirmation',
      context: { recipientName: name },
    });

    return { message: 'You are all signed up!' };
  }

  async getAllWaitlist(page: number = 1, limit: number = 10) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const [waitlist, total] = await this.waitlistRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: 'Success',
      status_code: 200,
      message: 'Waitlist found successfully',
      data: {
        waitlist,
        total_waitlist_count: total,
        current_page: page,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}
