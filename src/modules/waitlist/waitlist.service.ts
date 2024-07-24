import { Injectable } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './waitlist.entity';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
dotenv.config()

@Injectable()
export class WaitlistService {
  constructor(@InjectRepository(Waitlist) private readonly waitlistRepo: Repository<Waitlist>) {}
  async create(createWaitlistUserDto: CreateWaitlistUserDto) {
    const waitlistUser = await this.waitlistRepo.create(createWaitlistUserDto);
    return await this.waitlistRepo.save(waitlistUser);
  }

  async emailExist(email: string) {
    const foundUser = await this.waitlistRepo.findOne({ where: { email } });
    if (foundUser) return true;
    else return false;
  }

  async sendMail(email: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.MAILER_PASSWORD,
      },
  })

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Waitlist Confirmation',
    text: 'You are all signed up!',
  };

  await transporter.sendMail(mailOptions);
}
}
