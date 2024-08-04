import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpCenterEntity } from '../help-center/entities/help-center.entity'; // Adjust the path as necessary
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { UpdateHelpCenterDto } from './dto/update-help-center.dto';
import { SearchHelpCenterDto } from './dto/search-help-center.dto';
import { HelpCenter } from './interface/help-center.interface';
import { REQUEST_SUCCESSFUL } from 'src/helpers/SystemMessages';

@Injectable()
export class HelpCenterService {
  constructor(
    @InjectRepository(HelpCenterEntity)
    private readonly helpCenterRepository: Repository<HelpCenterEntity>
  ) {}

  async create(createHelpCenterDto: CreateHelpCenterDto) {
    let helpCenter = this.helpCenterRepository.create({
      ...createHelpCenterDto,
      author: 'ADMIN',
    });
    const newEntity = await this.helpCenterRepository.save(helpCenter);
    return {
      status_code: HttpStatus.OK,
      message: REQUEST_SUCCESSFUL,
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
    await this.helpCenterRepository.update(id, updateHelpCenterDto);
    const query = this.helpCenterRepository.findOneBy({ id });
    return {
      status_code: HttpStatus.OK,
      message: REQUEST_SUCCESSFUL,
    };
  }

  async removeTopic(id: string): Promise<void> {
    await this.helpCenterRepository.delete(id);
  }
}
