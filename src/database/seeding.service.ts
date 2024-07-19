import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedingService {
  constructor(@InjectRepository(Waitlist) private waitlistRepo: Repository<Waitlist>) {}

  async seed() {
    const waitlists = [
      {
        email: 'me@example.com',
        fullName: 'John Doe',
      },
      {
        email: 'me@example.com2',
        fullName: 'John Dean',
      },
    ];
    for (const data of waitlists) {
      const waitlist = this.waitlistRepo.findOne({ where: { email: data.email } });
      if (!waitlist) {
        await this.waitlistRepo.save(data);
      }
    }
  }
}
