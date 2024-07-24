import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { Testimonial } from './entities/testimonials.entity';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  async create(createTestimonialDto: CreateTestimonialDto, userId: string) {
    const { content, name } = createTestimonialDto;

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException({
        status: 'Not Found',
        message: 'User not found',
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
