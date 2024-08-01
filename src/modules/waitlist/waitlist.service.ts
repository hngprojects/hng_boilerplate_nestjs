import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './waitlist.entity';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
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
        message: 'Duplicate email',
      };
    }
    const waitlistUser = await this.waitlistRepo.create(createWaitlistUserDto);
    await this.waitlistRepo.save(waitlistUser);
    await this.emailService.sendWaitListMail(createWaitlistUserDto.email, process.env.CLIENT_URL);
    return {
      status_code: HttpStatus.CREATED,
      message: 'User added to waitlist successfully',
      user: waitlistUser,

  async getAllWaitlist() {
    const waitlist = await this.waitlistRepo.find();
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
