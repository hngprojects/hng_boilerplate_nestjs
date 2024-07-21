import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HelpCenterTopic } from 'src/entities/help-center-topic.entity';
import { Repository } from 'typeorm';
import {
  helpCenterTopicDto,
  helpCenterTopicErrorResponseDto,
  helpCenterTopicSuccessResponseDto,
} from './dto/help-center-topic.dto';

@Injectable()
export class HelpCenterTopicService {
  constructor(
    @InjectRepository(HelpCenterTopic)
    private helpCenterTopicRepository: Repository<HelpCenterTopic>
  ) {}

  async searchTitles(title: string): Promise<helpCenterTopicSuccessResponseDto | helpCenterTopicErrorResponseDto> {
    try {
      const topics: helpCenterTopicDto[] = await this.helpCenterTopicRepository.find({
        select: {
          id: true,
          title: true,
          content: true,
          author: true,
        },
        where: { title: title },
      });

      if (topics.length === 0) {
        throw new NotFoundException({
          success: false,
          message: 'No topics found',
          status_code: 404,
        });
      }

      return {
        success: true,
        message: 'Topics found',
        status_code: 200,
        topics: topics,
      };
    } catch (err) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Internal server error',
        status_code: 500,
      });
    }
  }
}
