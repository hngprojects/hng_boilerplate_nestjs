import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './waitlist.entity';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { EMAIL_EXISTS, WAITLIST_USER_CREATED_SUCCESSFULLY } from '../../helpers/SystemMessages';
import { EmailService } from '../email/email.service';
dotenv.config();

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist) private readonly waitlistRepo: Repository<Waitlist>,
    private readonly emailService: EmailService
  ) {}
  async create(createWaitlistUserDto: CreateWaitlistUserDto) {
    const emailExist = await this.waitlistRepo.findOne({ where: { email: createWaitlistUserDto.email } });
    if (emailExist) {
      return {
        status_code: HttpStatus.CONFLICT,
        message: EMAIL_EXISTS,
      };
    }
    const waitlistUser = await this.waitlistRepo.create(createWaitlistUserDto);
    const user = await this.waitlistRepo.save(waitlistUser);
    await this.emailService.sendWaitListMail(createWaitlistUserDto.email, process.env.CLIENT_URL);
    return {
      status_code: HttpStatus.CREATED,
      message: WAITLIST_USER_CREATED_SUCCESSFULLY,
      user,
    };
  }
}
