import { Injectable, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faqs } from './entities/faqs.entity';
import { CreateFaqDto } from './dto/createFaqsDto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faqs) private readonly faqsRepo: Repository<Faqs>,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async createFaq(createFaqs: CreateFaqDto, userId: string) {
    try {
      const user = await this.userRepo.findOneBy({ id: userId });
      const existingFaq = await this.faqsRepo.findOneBy({ question: createFaqs.question });

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
      throw new ForbiddenException({
        status: 'Inter server error',
        message: 'An error occured, please try again',
        status_code: 500,
      });
    }
  }
}
