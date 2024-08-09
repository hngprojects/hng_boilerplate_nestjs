import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { Testimonial } from './entities/testimonials.entity';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import UserService from '../user/user.service';
import { TestimonialMapper } from './mappers/testimonial.mapper';
import { TestimonialResponseMapper } from './mappers/testimonial-response.mapper';
import { TestimonialResponse } from './interfaces/testimonial-response.interface';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private userService: UserService
  ) {}
  async createTestimonial(createTestimonialDto: CreateTestimonialDto, user) {
    try {
      const { content, name } = createTestimonialDto;

      if (!user) {
        throw new NotFoundException({
          status: 'error',
          error: 'Not Found',
          status_code: HttpStatus.NOT_FOUND,
        });
      }

      const newTestimonial = await this.testimonialRepository.save({
        user,
        name,
        content,
      });

      return {
        id: newTestimonial.id,
        user_id: user.id,
        ...createTestimonialDto,
        created_at: new Date(),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException({
          error: `An internal server error occurred: ${error.message}`,
        });
      }
    }
  }

  async getAllTestimonials(userId: string, page: number, pageSize: number) {
    const user = await this.userService.getUserRecord({
      identifier: userId,
      identifierType: 'id',
    });

    if (!user) throw new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    let testimonials = await this.testimonialRepository.find({
      relations: ['user'],
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!testimonials.length) throw new CustomHttpException(SYS_MSG.NO_USER_TESTIMONIALS, HttpStatus.BAD_REQUEST);

    testimonials = testimonials.slice((page - 1) * pageSize, page * pageSize);

    const data = testimonials.map(testimonial => TestimonialMapper.mapToEntity(testimonial));

    return {
      message: SYS_MSG.USER_TESTIMONIALS_FETCHED,
      data: {
        user_id: userId,
        testimonials: data,
      },
      pagination: {
        page: page,
        page_size: pageSize,
        total_pages: Math.ceil(testimonials.length / pageSize),
      },
    };
  }
  async getTestimonialById(testimonialId: string): Promise<TestimonialResponse> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id: testimonialId },
      relations: ['user'],
    });

    if (!testimonial) {
      throw new CustomHttpException('Testimonial not found', HttpStatus.NOT_FOUND);
    }

    return TestimonialResponseMapper.mapToEntity(testimonial);
  }

  async updateTestimonial(id: string, updateTestimonialDto: UpdateTestimonialDto, userId: string) {
    const testimonial = await this.testimonialRepository.findOne({ where: { id, user: { id: userId } } });
  
    if (!testimonial) {
      throw new CustomHttpException('Testimonial not found', HttpStatus.NOT_FOUND);
    }
  
    Object.assign(testimonial, updateTestimonialDto);
    await this.testimonialRepository.save(testimonial);
  
    return {
      id: testimonial.id,
      user_id: userId,
      content: testimonial.content,
      name: testimonial.name,
      updated_at: new Date(),
    };
  } 

  async deleteTestimonial(id: string) {
    const testimonial = await this.testimonialRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new CustomHttpException('Testimonial not found', HttpStatus.NOT_FOUND);
    }
    await this.testimonialRepository.remove(testimonial);
    return {
      message: 'Testimonial deleted successfully',
      status_code: HttpStatus.OK,
    };
  }
}
