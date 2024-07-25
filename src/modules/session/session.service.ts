import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
  ) {}

  async createSession(createSessionDto: CreateSessionDto) {
    const session = this.sessionsRepository.create(createSessionDto);
    return await this.sessionsRepository.save(session);
  }
}
