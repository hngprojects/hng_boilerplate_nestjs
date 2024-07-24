import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './waitlist.entity';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { EMAIL_EXISTS, WAITLIST_USER_CREATED_SUCCESSFULLY } from 'src/helpers/SystemMessages';
dotenv.config();

@Injectable()
export class WaitlistService {
  constructor(@InjectRepository(Waitlist) private readonly waitlistRepo: Repository<Waitlist>) {}
  async create(createWaitlistUserDto: CreateWaitlistUserDto) {
    const emailExist = await this.waitlistRepo.findOne({ where: { email: createWaitlistUserDto.email } });
    if (emailExist) {
      return {
        status_code: HttpStatus.CONFLICT,
        message: EMAIL_EXISTS,
      };
    }
    const waitlistUser = await this.waitlistRepo.create(createWaitlistUserDto);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.MAILER_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: waitlistUser.email,
      subject: 'Waitlist Confirmation',
      text: 'You are all signed up!',
    };
    await transporter.sendMail(mailOptions);
    const user = await this.waitlistRepo.save(waitlistUser);
    return {
      status_code: HttpStatus.CREATED,
      message: WAITLIST_USER_CREATED_SUCCESSFULLY,
      user,
    };
  }
}
