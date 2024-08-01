import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { HelpCenterEntity } from './help-center.entity';
import { HelpCenter } from './help-center.interface';
import { SearchHelpCenterDto } from './dto/search-help-center.dto';

@Injectable()
export class HelpCenterService {
  constructor(
    @InjectRepository(HelpCenterEntity)
    private readonly helpCenterRepository: Repository<HelpCenterEntity>
  ) {}

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
}
