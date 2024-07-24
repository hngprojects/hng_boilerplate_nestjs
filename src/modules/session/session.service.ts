import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
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

  async getSession(session_id: string) {
    return await this.sessionsRepository.findOne({
      where: { id: session_id },
    });
  }

  async getSessionsByUser(user_id: string) {
    return await this.sessionsRepository.find({
      where: {
        user: {
          id: user_id,
        },
      },
    });
  }
}
