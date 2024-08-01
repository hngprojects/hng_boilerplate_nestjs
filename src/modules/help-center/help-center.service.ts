import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpCenter } from '../help-center/entities/help-center.entity'; // Adjust the path as necessary
import { CreateHelpCenterDto } from './dto/create-help-center.dto';
import { UpdateHelpCenterDto } from './dto/update-help-center.dto';

@Injectable()
export class HelpCenterService {
  constructor(
    @InjectRepository(HelpCenter)
    private readonly helpCenterRepository: Repository<HelpCenter>
  ) {}

  async updateTopic(id: string, updateHelpCenterDto: UpdateHelpCenterDto): Promise<HelpCenter> {
    await this.helpCenterRepository.update(id, updateHelpCenterDto);
    return this.helpCenterRepository.findOneBy({ id });
  }

  async removeTopic(id: string): Promise<void> {
    await this.helpCenterRepository.delete(id);
  }
}
