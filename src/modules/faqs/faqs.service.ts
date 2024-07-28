import { Injectable, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faqs } from './entities/faqs.entity';
import { CreateFaqDto } from './dto/createFaqsDto';
import UserService from '../user/user.service';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faqs) private readonly faqsRepo: Repository<Faqs>,
    private readonly userService: UserService
  ) {}

  async createFaq(createFaqs: CreateFaqDto, userId: string) {
    try {
      const existingFaq = await this.faqsRepo.findOneBy({ question: createFaqs.question });
      const user = await this.userService.getUserRecord({ identifierType: 'id', identifier: userId });

      if (user?.user_type !== 'admin') {
        throw new ForbiddenException({
          status: 'Forbidden request',
          message: 'User not authorized to perform operation',
          status_code: 403,
        });
      }

      if (existingFaq) {
        throw new BadRequestException({
          status: 'Bad request',
          message: 'Faqs question exist',
          status_code: 400,
        });
      }

      let newFaqs = this.faqsRepo.create(createFaqs);

      newFaqs = await this.faqsRepo.save(newFaqs);

      return { message: 'FAQ created successfully', data: newFaqs };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      } else {
        throw new InternalServerErrorException({
          status: 'Internal server error',
          message: 'An error occurred, please try again',
          status_code: 500,
        });
      }
    }
  }
}
