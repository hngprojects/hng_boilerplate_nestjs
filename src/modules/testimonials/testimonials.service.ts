import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
      }
      throw new InternalServerErrorException(`An internal server error occurred: ${error.message}`);
    }
  }
}
