import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { Testimonial } from '../entities/testimonials.entity';
import { TestimonialsService } from '../testimonials.service';

describe('TestimonialsService', () => {
  let service: TestimonialsService;
  let userRepository: Repository<User>;
  let testimonialRepository: Repository<Testimonial>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestimonialsService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Testimonial),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TestimonialsService>(TestimonialsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    testimonialRepository = module.get<Repository<Testimonial>>(getRepositoryToken(Testimonial));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a testimonial successfully', async () => {
      const userId = 'test-user-id';
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'I am very happy with the service provided by the company',
      };
      const user = { id: userId } as User;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(testimonialRepository, 'save').mockResolvedValue(undefined);

      const result = await service.createTestimonial(createTestimonialDto, userId);

      expect(result).toEqual({
        user_id: userId,
        ...createTestimonialDto,
        created_at: expect.any(Date),
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const userId = 'test-user-id';
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'I am very happy with the service provided by the company',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.createTestimonial(createTestimonialDto, userId)).rejects.toThrow(
        new NotFoundException({
          status: 'Not Found',
          message: 'User not found',
          status_code: 404,
        })
      );
    });

    it('should throw an error if testimonialRepository.save throws an error', async () => {
      const userId = 'test-user-id';
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'I am very happy with the service provided by the company',
      };
      const user = { id: userId } as User;
      const error = new Error('Test error');

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(testimonialRepository, 'save').mockRejectedValue(error);

      await expect(service.createTestimonial(createTestimonialDto, userId)).rejects.toThrow(error);
    });
  });

  describe('Delete testimonial', () => {
    beforeEach(() => {
      jest.spyOn(testimonialRepository, 'findOneBy').mockImplementationOnce(async ({ id }: { id: string }) => {
        if (id === 'correct-id') {
          return { id } as Testimonial;
        } else {
          return null;
        }
      });
      jest.spyOn(testimonialRepository, 'delete').mockResolvedValueOnce({ affected: 1, raw: '' });
    });

    it('Should throw error, Testimonial not found', async () => {
      try {
        await service.deleteTestimonial('wrong-id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).getResponse()).toEqual({
          success: false,
          message: 'Testimonial not found',
          status_code: HttpStatus.NOT_FOUND,
        });
        expect(jest.spyOn(testimonialRepository, 'delete')).not.toHaveBeenCalled();
      }
    });

    it('should delete testimonial', async () => {
      await service.deleteTestimonial('correct-id');
      expect(jest.spyOn(testimonialRepository, 'delete')).toHaveBeenCalled();
    });
  });
});
