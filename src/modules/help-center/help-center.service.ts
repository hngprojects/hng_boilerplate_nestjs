import { Injectable } from '@nestjs/common';
import { HelpCenter } from './help-center.entity';
import { CreateHelpCenterDto } from './create-help-center.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HelpCenterService {
  constructor(
    @InjectRepository(HelpCenter)
    private readonly helpCenterRepository: Repository<HelpCenter>
  ) {}

  async createHelpCenter(createHelpCenterDto: CreateHelpCenterDto, author: string): Promise<HelpCenter> {
    const helpCenter = this.helpCenterRepository.create({
      ...createHelpCenterDto,
      author,
    });

    return await this.helpCenterRepository.save(helpCenter);
  }

  async getAllHelpCenters(): Promise<HelpCenter[]> {
    return this.helpCenterRepository.find();
  }

  async getHelpCenterById(id: string): Promise<HelpCenter | null> {
    return this.helpCenterRepository.findOneBy({ id });
  }
}
