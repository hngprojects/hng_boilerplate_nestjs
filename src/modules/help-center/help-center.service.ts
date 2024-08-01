import { Injectable, NotFoundException } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpCenterEntity } from '../help-center/entities/help-center.entity'; // Adjust the path as necessary
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { UpdateHelpCenterDto } from './dto/update-help-center.dto';
import { SearchHelpCenterDto } from './dto/search-help-center.dto';
import { HelpCenter } from './interface/help-center.interface';

@Injectable()
export class HelpCenterService {
  constructor(
    @InjectRepository(HelpCenterEntity)
    private readonly helpCenterRepository: Repository<HelpCenterEntity>
  ) {}
    @InjectRepository(HelpCenterEntity)
    private readonly helpCenterRepository: Repository<HelpCenterEntity>,
  ) { }

  async create(createHelpCenterDto: CreateHelpCenterDto): Promise<HelpCenterEntity> {
    const helpCenter = this.helpCenterRepository.create({
      ...createHelpCenterDto,
      author: 'ADMIN',
    });
    return this.helpCenterRepository.save(helpCenter);
  }

  async findAll(): Promise<HelpCenter[]> {
    return this.helpCenterRepository.find();
  }

  async findOne(id: string): Promise<HelpCenterEntity> {
    const helpCenter = await this.helpCenterRepository.findOne({ where: { id } });
    if (!helpCenter) {
      throw new NotFoundException(`Help center topic with ID ${id} not found`);
    }
    return helpCenter;
  }

  async search(criteria: SearchHelpCenterDto): Promise<HelpCenter[]> {
    const queryBuilder = this.helpCenterRepository.createQueryBuilder('help_center');
    if (criteria.title) {
      queryBuilder.andWhere('help_center.title LIKE :title', { title: `%${criteria.title}%` });
    }
    if (criteria.content) {
      queryBuilder.andWhere('help_center.content LIKE :content', { content: `%${criteria.content}%` });
    }
    return queryBuilder.getMany();
  }

  async updateTopic(id: string, updateHelpCenterDto: UpdateHelpCenterDto): Promise<HelpCenter> {
    await this.helpCenterRepository.update(id, updateHelpCenterDto);
    return this.helpCenterRepository.findOneBy({ id });
  }

  async removeTopic(id: string): Promise<void> {
    await this.helpCenterRepository.delete(id);
  }
}
