import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';
import UserInterface from '../user/interfaces/UserInterface';
import * as useragent from 'useragent';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
  ) {}

  async createSession(user: Partial<UserInterface>, userAgentString: string): Promise<Session> {
    const deviceInfo = this.parseUserAgent(userAgentString);
    const createSessionDto: CreateSessionDto = {
      userId: user.id,
      expires_at: new Date(Date.now() + 3600 * 1000),
      device_browser: deviceInfo.device_browser,
      device_browser_version: deviceInfo.device_browser_version,
      device_os: deviceInfo.device_os,
      device_os_version: deviceInfo.device_os_version,
      device_type: deviceInfo.device_type,
      device_brand: deviceInfo.device_brand,
      device_model: deviceInfo.device_model,
    };

    const session = this.sessionsRepository.create(createSessionDto);
    return await this.sessionsRepository.save(session);
  }

  private parseUserAgent(userAgentString: string) {
    const agent = useragent.parse(userAgentString || '');

    return {
      device_browser: agent.family || 'unknown',
      device_browser_version: agent.toVersion() || 'unknown',
      device_os: agent.os.family || 'unknown',
      device_os_version: agent.os.toVersion() || 'unknown',
      device_type: agent.device.family || 'unknown',
      device_brand: agent.device.brand || 'unknown',
      device_model: agent.device.model || 'unknown',
    };
  }
}
