import { Injectable, BadRequestException, ForbiddenException, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faqs } from './entities/faqs.entity';
import { CreateFaqDto, UpdateFaqDto } from './dto/createFaqsDto';
import UserService from '../user/user.service';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faqs) private readonly faqsRepo: Repository<Faqs>,
    private readonly userService: UserService
  ) {}

  async createFaqs(createFaqs: CreateFaqDto, userId: string) {
    const existingFaq = await this.faqsRepo.findOneBy({ question: createFaqs.question });
    const user = await this.userService.getUserRecord({ identifierType: 'id', identifier: userId });

    if (user?.user_type !== 'super-admin') {
      throw new ForbiddenException({
        status: 'Forbidden request',
        message: 'User not authorized to perform operation',
        status_code: HttpStatus.FORBIDDEN,
      });
    }

    if (existingFaq) {
      throw new BadRequestException({
        status: 'Bad request',
        message: 'Faqs question exist',
        status_code: HttpStatus.BAD_REQUEST,
      });
    }

    let newFaqs = this.faqsRepo.create(createFaqs);

    newFaqs = await this.faqsRepo.save(newFaqs);

    return { status_code: HttpStatus.CREATED, message: 'FAQ created successfully', data: newFaqs };
  }

  async updateFaqs(updatedFaqs: UpdateFaqDto, faqsId: string, userId: string) {
    const user = await this.userService.getUserRecord({ identifierType: 'id', identifier: userId });
    const existingFaq = await this.faqsRepo.findOneBy({ id: faqsId });

    if (user?.user_type !== 'super-admin') {
      throw new ForbiddenException({
        status: 'Forbidden request',
        message: 'User not authorized to perform operation',
        status_code: HttpStatus.FORBIDDEN,
      });
    }

    if (updatedFaqs.question) {
      const existingFaqQuestion = await this.faqsRepo.findOneBy({ question: updatedFaqs.question });

      if (existingFaqQuestion && existingFaqQuestion.id !== faqsId) {
        throw new BadRequestException({
          status: 'Bad request',
          message: 'Faqs question exist',
          status_code: HttpStatus.BAD_REQUEST,
        });
      }
    }

    if (!existingFaq) {
      throw new NotFoundException({
        status: 'Not found',
        message: 'FAQ not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }

    Object.assign(existingFaq, updatedFaqs);

    const updatedFaq = await this.faqsRepo.save(existingFaq);

    return { message: 'FAQ updated successfully', status_code: HttpStatus.OK, data: updatedFaq };
  }
}
