import { InternalServerErrorException, NotFoundException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { User } from '../../user/entities/user.entity';
import UserService from '../../user/user.service';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { Testimonial } from '../entities/testimonials.entity';
import { TestimonialsService } from '../testimonials.service';
import { TextService } from '../../translation/translation.service';

describe('TestimonialsService', () => {
  let service: TestimonialsService;
  let userService: UserService;
  let testimonialRepository: Repository<Testimonial>;
  class MockTextService {
    translateText(text: string, targetLang: string) {
      return Promise.resolve(text);
    }
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestimonialsService,
        UserService,
        {
          provide: TextService,
          useClass: MockTextService,
        },
        {
          provide: getRepositoryToken(Testimonial),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Profile),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TestimonialsService>(TestimonialsService);
    userService = module.get<UserService>(UserService);
    testimonialRepository = module.get<Repository<Testimonial>>(getRepositoryToken(Testimonial));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateTestimonial', () => {
    it('should successfully update a testimonial', async () => {
      const id = 'testimonial_id';
      const updateTestimonialDto: UpdateTestimonialDto = {
        name: 'Updated Name',
        content: 'Updated content!',
      };
      const userId = 'user_id';
      const testimonial = { id, user: { id: userId }, ...updateTestimonialDto } as Testimonial;

      jest.spyOn(testimonialRepository, 'findOne').mockResolvedValue(testimonial);
      jest.spyOn(testimonialRepository, 'save').mockResolvedValue(testimonial);

      const result = await service.updateTestimonial(id, updateTestimonialDto, userId);

      expect(result).toEqual({
        id,
        user_id: userId,
        ...updateTestimonialDto,
        updated_at: expect.any(Date),
      });
    });

    it('should throw a NotFoundException if testimonial is not found', async () => {
      const id = 'testimonial_id';
      const updateTestimonialDto: UpdateTestimonialDto = {
        name: 'Updated Name',
        content: 'Updated content!',
      };
      const userId = 'user_id';

      jest.spyOn(testimonialRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateTestimonial(id, updateTestimonialDto, userId)).rejects.toThrow(
        new NotFoundException('Testimonial not found')
      );
    });
  });
});
