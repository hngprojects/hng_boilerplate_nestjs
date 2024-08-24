import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpCenterEntity } from '../help-center/entities/help-center.entity';
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { UpdateHelpCenterDto } from './dto/update-help-center.dto';
import { SearchHelpCenterDto } from './dto/search-help-center.dto';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { User } from '../user/entities/user.entity';
import { TextService } from '../translation/translation.service';

@Injectable()
export class HelpCenterService {
  constructor(
    @InjectRepository(HelpCenterEntity)
    private readonly helpCenterRepository: Repository<HelpCenterEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly textService: TextService
  ) {}

  private async translateContent(content: string, lang: string) {
    return this.textService.translateText(content, lang);
  }

  async create(createHelpCenterDto: CreateHelpCenterDto, user: User, language: string = 'en') {
    const existingTopic = await this.helpCenterRepository.findOne({
      where: { title: createHelpCenterDto.title },
    });

    if (existingTopic) {
      throw new CustomHttpException(SYS_MSG.QUESTION_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['first_name', 'last_name'],
    });

    if (!fullUser) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    let translatedContent = createHelpCenterDto.content;
    if (language && language !== 'en') {
      translatedContent = await this.translateContent(createHelpCenterDto.content, language);
    }

    const helpCenter = this.helpCenterRepository.create({
      ...createHelpCenterDto,
      content: translatedContent,
      author: `${fullUser.first_name} ${fullUser.last_name}`,
    });
    const newEntity = await this.helpCenterRepository.save(helpCenter);

    return {
      status_code: HttpStatus.CREATED,
      message: 'Request successful',
      data: newEntity,
    };
  }

  async findAll(language?: string): Promise<any> {
    const centres = await this.helpCenterRepository.find();
    const translatedhCTopics = await Promise.all(
      centres.map(async topic => {
        topic.title = await this.translateContent(topic.title, language);
        topic.content = await this.translateContent(topic.content, language);
        return topic;
      })
    );

    return {
      data: translatedhCTopics,
      status_code: HttpStatus.OK,
      message: SYS_MSG.REQUEST_SUCCESSFUL,
    };
  }

  async findOne(id: string) {
    const helpCenter = await this.helpCenterRepository.findOne({ where: { id } });
    if (!helpCenter) {
      throw new NotFoundException(`Help center topic with ID ${id} not found`);
    }
    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.REQUEST_SUCCESSFUL,
      data: helpCenter,
    };
  }

  async findHelpCenter(id: string) {
    const helpCenter = await this.findOne(id);
    if (!helpCenter) {
      throw new CustomHttpException(`Help center topic with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return helpCenter;
  }

  async search(criteria: SearchHelpCenterDto) {
    const queryBuilder = this.helpCenterRepository.createQueryBuilder('help_center');
    if (criteria.title) {
      queryBuilder.andWhere('help_center.title LIKE :title', { title: `%${criteria.title}%` });
    }
    if (criteria.content) {
      queryBuilder.andWhere('help_center.content LIKE :content', { content: `%${criteria.content}%` });
    }
    const query = await queryBuilder.getMany();
    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.REQUEST_SUCCESSFUL,
      data: query,
    };
  }

  async updateTopic(id: string, updateHelpCenterDto: UpdateHelpCenterDto) {
    const existingTopic = await this.helpCenterRepository.findOneBy({ id });
    if (!existingTopic) {
      throw new HttpException(
        {
          status: 'error',
          message: SYS_MSG.TOPIC_NOT_FOUND,
          status_code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND
      );
    }

    await this.helpCenterRepository.update(id, updateHelpCenterDto);
    const updatedTopic = await this.helpCenterRepository.findOneBy({ id });

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.REQUEST_SUCCESSFUL,
      data: updatedTopic,
    };
  }

  async removeTopic(id: string): Promise<void> {
    const existingTopic = await this.helpCenterRepository.findOneBy({ id });
    if (!existingTopic) {
      throw new HttpException(
        {
          status: 'error',
          message: SYS_MSG.TOPIC_NOT_FOUND,
          status_code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND
      );
    }
    await this.helpCenterRepository.delete(id);
  }
}
