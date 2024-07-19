import { Injectable } from '@nestjs/common';
import { CreateWaitlistUserDto } from './dto/create-waitlist-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from '../../database/entities/waitlist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WaitlistService {
  constructor(@InjectRepository(Waitlist) private readonly waitlistRepo: Repository<Waitlist>) {}
  async create(createWaitlistUserDto: CreateWaitlistUserDto) {
    const waitlistUser = await this.waitlistRepo.create(createWaitlistUserDto);
    return await this.waitlistRepo.save(waitlistUser);
  }

  async findOne(id: string) {
    return await this.waitlistRepo.findOne({ where: { id } });
  }

  async findAll() {
    return await this.waitlistRepo.find();
  }
}
