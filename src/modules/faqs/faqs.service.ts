import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faqs } from 'src/database/entities/faqs.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faqs)
    private readonly faqsRepository: Repository<Faqs>
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faqs> {
    const faq = this.faqsRepository.create(createFaqDto);
    return await this.faqsRepository.save(faq);
  }

  async findAll(): Promise<Faqs[]> {
    return await this.faqsRepository.find();
  }

  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faqs> {
    await this.faqsRepository.update(id, updateFaqDto);
    return this.faqsRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.faqsRepository.delete(id);
  }
}
