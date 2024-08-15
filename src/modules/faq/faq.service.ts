import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { IFaq } from './faq.interface';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { TextService } from '../../translation/translation.service';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
    private readonly textService: TextService,
  ) {}

  private async translateContent(content: string, lang: string) {
    return this.textService.translateText(content, lang);
  }

  async create(createFaqDto: CreateFaqDto, language?: string): Promise<IFaq> {
    const { question, answer, category } = createFaqDto;

    const translatedQuestion = await this.translateContent(question, language);
    const translatedAnswer = await this.translateContent(answer, language);
    const translatedCategory = await this.translateContent(category, language);

    const faq = this.faqRepository.create({
      ...createFaqDto,
      question: translatedQuestion,
      answer: translatedAnswer,
      category: translatedCategory,
    });

    return this.faqRepository.save(faq);
  }

  async findAllFaq(language?: string) {
    const faqs = await this.faqRepository.find();

    const translatedFaqs = await Promise.all(
      faqs.map(async (faq) => {
        faq.question = await this.translateContent(faq.question, language);
        faq.answer = await this.translateContent(faq.answer, language);
        faq.category = await this.translateContent(faq.category, language);
        return faq;
      }),
    );

    return {
      message: 'Faq fetched successfully',
      status_code: 200,
      data: translatedFaqs,
    };
  }

  async updateFaq(id: string, updateFaqDto: UpdateFaqDto, language?: string) {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new BadRequestException({
        message: 'Invalid request data',
        status_code: 400,
      });
    }

    const updatedFaq = {
      ...faq,
      ...updateFaqDto,
    };

    if (updateFaqDto.question) {
      updatedFaq.question = await this.translateContent(updateFaqDto.question, language);
    }

    if (updateFaqDto.answer) {
      updatedFaq.answer = await this.translateContent(updateFaqDto.answer, language);
    }

    if (updateFaqDto.category) {
      updatedFaq.category = await this.translateContent(updateFaqDto.category, language);
    }

    await this.faqRepository.save(updatedFaq);

    return {
      id: updatedFaq.id,
      question: updatedFaq.question,
      answer: updatedFaq.answer,
      category: updatedFaq.category,
    };
  }

  async removeFaq(id: string) {
    const result = await this.faqRepository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException({
        message: 'Invalid request',
        status_code: 400,
      });
    }
    return {
      message: 'FAQ successfully deleted',
    };
  }
}
