import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpCenterEntity } from '../help-center/entities/help-center.entity';
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { UpdateHelpCenterDto } from './dto/update-help-center.dto';
import { SearchHelpCenterDto } from './dto/search-help-center.dto';
import { REQUEST_SUCCESSFUL, QUESTION_ALREADY_EXISTS, USER_NOT_FOUND } from '../../helpers/SystemMessages';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { User } from '../user/entities/user.entity';

@Injectable()
export class HelpCenterService {
  constructor(
    @InjectRepository(HelpCenterEntity)
    private readonly helpCenterRepository: Repository<HelpCenterEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createHelpCenterDto: CreateHelpCenterDto, user: User) {
    const existingTopic = await this.helpCenterRepository.findOne({
      where: { title: createHelpCenterDto.title },
    });

    if (existingTopic) {
      throw new CustomHttpException(QUESTION_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['first_name', 'last_name'],
    });

    if (!fullUser) {
      throw new CustomHttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const helpCenter = this.helpCenterRepository.create({
      ...createHelpCenterDto,
      author: `${fullUser.first_name} ${fullUser.last_name}`,
    });
    const newEntity = await this.helpCenterRepository.save(helpCenter);

    return {
      status_code: HttpStatus.CREATED,
      message: 'Request successful',
      data: newEntity,
    };
  }

  async findAll(): Promise<any> {
    const centres = await this.helpCenterRepository.find();

    return {
      data: centres,
      status_code: HttpStatus.OK,
      message: REQUEST_SUCCESSFUL,
    };
  }

  async findOne(id: string) {
    const helpCenter = await this.helpCenterRepository.findOne({ where: { id } });
    if (!helpCenter) {
      throw new NotFoundException(`Help center topic with ID ${id} not found`);
    }
    return {
      status_code: HttpStatus.OK,
      message: REQUEST_SUCCESSFUL,
      data: helpCenter,
    };
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
      message: REQUEST_SUCCESSFUL,
      data: query,
    };
  }

  async updateTopic(id: string, updateHelpCenterDto: UpdateHelpCenterDto) {
    const existingTopic = await this.helpCenterRepository.findOneBy({ id });
    if (!existingTopic) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Topic not found, please check and try again',
          status_code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND
      );
    }

    await this.helpCenterRepository.update(id, updateHelpCenterDto);
    const updatedTopic = await this.helpCenterRepository.findOneBy({ id });
  
    return {
      status_code: HttpStatus.OK,
      message: REQUEST_SUCCESSFUL,
      data: updatedTopic,
    };
  }
  

  async removeTopic(id: string): Promise<void> {
    const existingTopic = await this.helpCenterRepository.findOneBy({ id });
    if (!existingTopic) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Topic not found, unable to delete',
          status_code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND
      );
    }
    await this.helpCenterRepository.delete(id);
  }
  
}
