import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddToWaitlistRequestDto } from './dto/add-to-waitlist-request.dto';

@Injectable()
export default class WaitlistService {
  constructor(@InjectRepository(Waitlist) private readonly waitlistRepository: Repository<Waitlist>) {}
  async addToWaitlist(addToWaitlistRequestDto: AddToWaitlistRequestDto) {
    try {
      const addToWaitlist = await this.waitlistRepository.save(addToWaitlistRequestDto);
      return {
        status: 201,
        message: 'Added to waitlist',
        data: {
          user: addToWaitlist,
        },
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('duplicate key')) {
          throw new ConflictException('Email already exists in waitlist');
        }
      }
      throw new InternalServerErrorException('An error occurred adding to waitlist');
    }
  }

  async getAllWaitlist() {
    return await this.waitlistRepository.find();
  }
}
