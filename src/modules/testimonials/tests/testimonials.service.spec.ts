import { InternalServerErrorException, NotFoundException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { User } from '../../user/entities/user.entity';
import UserService from '../../user/user.service';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { Testimonial } from '../entities/testimonials.entity';
import { TestimonialsService } from '../testimonials.service';
import * as SYS_MSG from '../../../helpers/SystemMessages';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { mockUser } from '../../organisations/tests/mocks/user.mock';
import { testimonialsMock } from './mocks/testimonials.mock';
import { TextService } from '../../translation/translation.service';

class MockTextService {
  translateText(text: string, targetLang: string) {
    return Promise.resolve(text);
  }
}

describe('TestimonialsService', () => {
  let service: TestimonialsService;
  let userService: UserService;
  let testimonialRepository: Repository<Testimonial>;

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

  describe('createTestimonial', () => {
    it('should successfully create a testimonial', async () => {
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'Great service!',
      };
      const user = { id: 'user_id' } as User;
      const testimonial = {
        id: 'test_id',
        ...createTestimonialDto,
        created_at: new Date(),
      } as Testimonial;

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(testimonialRepository, 'save').mockResolvedValue(testimonial);

      const result = await service.createTestimonial(createTestimonialDto, user);

      expect(result).toEqual({
        id: 'test_id',
        user_id: 'user_id',
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
          message: 'Not Found Exception',
          status_code: 404,
        })
      );
    });

    it('should handle other errors with InternalServerErrorException', async () => {
      const createTestimonialDto: CreateTestimonialDto = {
        name: 'John Doe',
        content: 'Great service!',
      };
      const user = { id: 'user_id' } as User;
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

  describe("retrieve all user's testimonials", () => {
    it('should validate the user id', async () => {
      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(null);

      await expect(service.getAllTestimonials('user_id', 1, 10)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw an error if the user has no testimonials', async () => {
      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(mockUser);
      jest.spyOn(testimonialRepository, 'find').mockResolvedValue([]);

      await expect(service.getAllTestimonials('user_id', 1, 10)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.NO_USER_TESTIMONIALS, HttpStatus.BAD_REQUEST)
      );
    });

    it('should return all testimonials for a user', async () => {
      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(mockUser);
      jest.spyOn(testimonialRepository, 'find').mockResolvedValue(testimonialsMock);

      const res = await service.getAllTestimonials(mockUser.id, 1, 5);

      expect(res.message).toEqual(SYS_MSG.USER_TESTIMONIALS_FETCHED);
      expect(res.data.testimonials.length).toEqual(testimonialsMock.length);
      expect(res.data.user_id).toEqual(mockUser.id);
    });
  });

  describe('deleteTestimonial', () => {
    it('should successfully delete a testimonial', async () => {
      const testimonialId = 'test_id';
      const mockTestimonial = new Testimonial();
      mockTestimonial.id = testimonialId;

      jest.spyOn(testimonialRepository, 'findOne').mockResolvedValue(mockTestimonial);
      jest.spyOn(testimonialRepository, 'remove').mockResolvedValue(undefined);

      const result = await service.deleteTestimonial(testimonialId);

      expect(testimonialRepository.findOne).toHaveBeenCalledWith({ where: { id: testimonialId } });
      expect(testimonialRepository.remove).toHaveBeenCalledWith(mockTestimonial);
      expect(result).toEqual({
        message: 'Testimonial deleted successfully',
        status_code: HttpStatus.OK,
      });
    });

    it('should throw CustomHttpException when testimonial is not found', async () => {
      const id = 'non_existent_id';

      jest.spyOn(testimonialRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(testimonialRepository, 'remove').mockImplementation(jest.fn());

      await expect(service.deleteTestimonial(id)).rejects.toThrow(
        new CustomHttpException('Testimonial not found', HttpStatus.NOT_FOUND)
      );

      expect(testimonialRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(testimonialRepository.remove).not.toHaveBeenCalled();
    });
  });
});
