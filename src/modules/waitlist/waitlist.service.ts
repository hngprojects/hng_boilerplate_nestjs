import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export default class WaitlistService {
  constructor(@InjectRepository(Waitlist) private readonly waitlistRepository: Repository<Waitlist>) {}

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
