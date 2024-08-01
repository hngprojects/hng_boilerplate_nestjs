import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './faq.entity';
import { CreateFaqDto } from './create-faq.dto';
import { IFaq } from './faq.interface';
import { UpdateFaqDto } from './update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<IFaq>
  ) { }

  async create(createFaqDto: CreateFaqDto): Promise<IFaq> {
    try {
      const faq = this.faqRepository.create(createFaqDto);
      return await this.faqRepository.save(faq);
    } catch (error) {
      throw new BadRequestException('Error creating FAQ');
    }
  }

  async findAllFaq() {
    try {
      const faqs = await this.faqRepository.find();
      return {
        message: 'Faq fetched successfully',
        status_code: 200,
        data: faqs,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          message: 'Invalid request',
          status_code: 400,
        };
      } else if (error instanceof InternalServerErrorException) {
        throw error;
      }
    }
  }

  async updateFaq(id: string, updateFaqDto: UpdateFaqDto) {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new BadRequestException({
        message: 'Invalid request data',
        status_code: 400,
      });
    }
    try {
      Object.assign(faq, updateFaqDto);
      const updatedFaq = await this.faqRepository.save(faq);
      return {
        id: updatedFaq.id,
        question: updatedFaq.question,
        answer: updatedFaq.answer,
        category: updatedFaq.category,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return {
          message: 'Unauthorized access',
          status_code: 401,
        };
      } else if (error instanceof BadRequestException) {
        return {
          message: 'Invalid request data',
          status_code: 400,
        };
      }
    }
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
