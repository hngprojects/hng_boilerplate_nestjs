import { HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import UserService from '../../user/user.service';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { Testimonial } from '../entities/testimonials.entity';
import { TestimonialsService } from '../testimonials.service';

describe('TestimonialsService', () => {
  let service: TestimonialsService;
  let userService: UserService;
  let testimonialRepository: Repository<Testimonial>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestimonialsService,
        UserService,
        {
          provide: getRepositoryToken(Testimonial),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TestimonialsService>(TestimonialsService);
    userService = module.get<UserService>(UserService);
    testimonialRepository = module.get<Repository<Testimonial>>(getRepositoryToken(Testimonial));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTestimonial', () => {
    it('should successfully create a testimonial', async () => {
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'Great service!',
      };
      const user = { id: 'user-id' } as User;

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(testimonialRepository, 'save').mockResolvedValue(undefined);

      const result = await service.createTestimonial(createTestimonialDto, user);

      expect(result).toEqual({
        user_id: 'user-id',
        ...createTestimonialDto,
        created_at: expect.any(Date),
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'Great service!',
      };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(null);

      await expect(service.createTestimonial(createTestimonialDto, null)).rejects.toThrow(
        new NotFoundException({
          status: 'error',
          error: 'Not Found',
          status_code: 404,
        })
      );
    });

    it('should handle other errors with InternalServerErrorException', async () => {
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'Great service!',
      };
      const user = { id: 'user-id' } as User;
      const error = new Error('Database error');

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(testimonialRepository, 'save').mockRejectedValue(error);

      await expect(service.createTestimonial(createTestimonialDto, user)).rejects.toThrow(
        new InternalServerErrorException({
          status: 'error',
          error: `An internal server error occurred: ${error.message}`,
          status_code: 500,
        })
      );
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
