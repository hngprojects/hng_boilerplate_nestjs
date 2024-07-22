import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HelpCenterTopic } from '../../database/entities/help-center-topic.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HelpCenterService {
  constructor(@InjectRepository(HelpCenterTopic) private helpCenterTopic: Repository<HelpCenterTopic>) {}

  async deleteTopic(id: string) {
    const topic = await this.helpCenterTopic.findOne({ where: { id } });

    if (!topic)
      throw new HttpException(
        { success: false, message: 'Topic not found', status_code: 'Not Found' },
        HttpStatus.NOT_FOUND
      );

    await this.helpCenterTopic.delete(id);
  }
}
