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

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>
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

      await this.testimonialRepository.save({
        user,
        name,
        content,
      });

      return {
        user_id: user.id,
        ...createTestimonialDto,
        created_at: new Date(),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException({
          status: 'error',
          error: `An internal server error occurred: ${error.message}`,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  async deleteTestimonial(id: string) {
    const testimonial = await this.testimonialRepository.findOneBy({ id });

    if (!testimonial)
      throw new NotFoundException({
        success: false,
        message: 'Testimonial not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    await this.testimonialRepository.delete({ id });
  }
}
