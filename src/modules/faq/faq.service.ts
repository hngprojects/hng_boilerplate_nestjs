import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { ICreateFaqResponse, IFaq } from './faq.interface';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<IFaq>
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<ICreateFaqResponse> {
    const faq = this.faqRepository.create(createFaqDto);
    const faqResponse: IFaq = await this.faqRepository.save(faq);
    const payload: IFaq = {
      question: faqResponse.question,
      answer: faqResponse.answer,
      category: faqResponse.category,
      id: faqResponse.id,
      created_at: faqResponse.created_at,
      updated_at: faqResponse.updated_at,
    };
    return { status_code: 201, message: 'FAQ created successfully', data: payload };
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
