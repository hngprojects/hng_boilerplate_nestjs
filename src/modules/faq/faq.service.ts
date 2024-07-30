import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './faq.entity';
import { CreateFaqDto } from './create-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>
  ) {}

  async create(createFaqDto: CreateFaqDto, createdBy: string): Promise<Faq> {
    const faq = this.faqRepository.create({ ...createFaqDto, createdBy });
    return this.faqRepository.save(faq);
  }
}
