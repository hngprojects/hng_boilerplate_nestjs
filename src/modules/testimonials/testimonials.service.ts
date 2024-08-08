// import {
//   HttpStatus,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { CreateTestimonialDto } from './dto/create-testimonial.dto';
// import { Testimonial } from './entities/testimonials.entity';

// @Injectable()
// export class TestimonialsService {
//   constructor(
//     @InjectRepository(Testimonial)
//     private readonly testimonialRepository: Repository<Testimonial>
//   ) {}
//   async createTestimonial(createTestimonialDto: CreateTestimonialDto, user) {
//     try {
//       const { content, name } = createTestimonialDto;

//       if (!user) {
//         throw new NotFoundException({
//           status: 'error',
//           error: 'Not Found',
//           status_code: HttpStatus.NOT_FOUND,
//         });
//       }

//       await this.testimonialRepository.save({
//         user,
//         name,
//         content,
//       });

//       return {
//         user_id: user.id,
//         ...createTestimonialDto,
//         created_at: new Date(),
//       };
//     } catch (error) {
//       if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
//         throw error;
//       } else {
//         throw new InternalServerErrorException({
//           error: `An internal server error occurred: ${error.message}`,
//         });
//       }
//     }
//   }
// }

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
import { CustomHttpException } from '../../helpers/custom-http-filter';

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

      const testimonial = this.testimonialRepository.create({
        user,
        name,
        content,
      });

      const savedTestimonial = await this.testimonialRepository.save(testimonial);

      return savedTestimonial;
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

  async getTestimonialById(testimonialId: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id: testimonialId },
      relations: ['user'],
    });

    if (!testimonial) {
      throw new CustomHttpException('Testimonial not found', HttpStatus.NOT_FOUND);
    }

    return testimonial;
  }
}
