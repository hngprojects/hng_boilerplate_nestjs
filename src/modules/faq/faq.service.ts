import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './faq.entity';
import { CreateFaqDto } from './create-faq.dto';
import { IFaq } from './faq.interface';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<IFaq>,
  ) { }

  async create(createFaqDto: CreateFaqDto): Promise<IFaq> {
    const faq = this.faqRepository.create(createFaqDto);
    return this.faqRepository.save(faq);
  }
}
