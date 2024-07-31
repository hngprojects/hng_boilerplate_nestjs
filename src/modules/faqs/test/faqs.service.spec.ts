import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FaqsService } from '../faqs.service';
import { Faqs } from '../entities/faqs.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateFaqDto, UpdateFaqDto } from '../dto/createFaqsDto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import UserService from '../../../modules/user/user.service';
import { UserType } from '../../../modules/organisations/tests/mocks/organisation.mock';

describe('FaqsService', () => {
  let service: FaqsService;
  let faqsRepository: jest.Mocked<Repository<Faqs>>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqsService,
        {
          provide: getRepositoryToken(Faqs),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: UserService,
          useValue: {
            getUserRecord: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FaqsService>(FaqsService);
    faqsRepository = module.get<Repository<Faqs>>(getRepositoryToken(Faqs)) as jest.Mocked<Repository<Faqs>>;
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Faqs', () => {
    it('should throw ForbiddenException if user is not super admin', async () => {
      userService.getUserRecord.mockResolvedValueOnce({ user_type: UserType.USER });
      faqsRepository.findOneBy.mockResolvedValueOnce({ id: 'faqId', question: 'Old Question' } as Faqs);

      await expect(service.createFaqs({ question: 'Updated Question' } as CreateFaqDto, 'userId')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException if FAQ already exists', async () => {
      userService.getUserRecord.mockResolvedValueOnce({ user_type: UserType.SUPER_ADMIN });
      faqsRepository.findOneBy.mockResolvedValueOnce({ question: 'Test Question' } as Faqs);

      await expect(service.createFaqs({ question: 'Test Question' } as CreateFaqDto, 'userId')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should create and return the new FAQ if valid', async () => {
      const createFaqDto = { question: 'Test Question', answer: 'Test Answer', category: '', tags: '' } as CreateFaqDto;
      const newFaq = createFaqDto as Faqs;

      userService.getUserRecord.mockResolvedValueOnce({ user_type: UserType.SUPER_ADMIN });
      faqsRepository.findOneBy.mockResolvedValueOnce(null);
      faqsRepository.create.mockReturnValueOnce(newFaq);
      faqsRepository.save.mockResolvedValueOnce(newFaq);

      const result = await service.createFaqs(createFaqDto, 'userId');

      expect(result).toEqual({ status_code: 201, message: 'FAQ created successfully', data: newFaq });
    });
  });

  describe('Update Faqs', () => {
    it('should throw ForbiddenException if user is not super admin', async () => {
      userService.getUserRecord.mockResolvedValueOnce({ user_type: UserType.USER });
      faqsRepository.findOneBy.mockResolvedValueOnce({ id: 'faqId', question: 'Old Question' } as Faqs);

      await expect(
        service.updateFaqs({ question: 'Updated Question' } as UpdateFaqDto, 'faqId', 'userId')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if FAQ already exists', async () => {
      userService.getUserRecord.mockResolvedValueOnce({ user_type: UserType.SUPER_ADMIN });
      faqsRepository.findOneBy
        .mockResolvedValueOnce({ id: 'faqId', question: 'Old Question' } as Faqs)
        .mockResolvedValueOnce({ id: 'existedFaqId', question: 'Test Question' } as Faqs);

      await expect(
        service.updateFaqs({ question: 'Test Question' } as UpdateFaqDto, 'faqId', 'userId')
      ).rejects.toThrow(BadRequestException);
    });

    it('should update and return the FAQ if valid', async () => {
      const updateFaqDto = { question: 'Updated Question' } as UpdateFaqDto;
      const existingFaq = { id: 'faqId', question: 'Old Question' } as Faqs;
      const updatedFaq = { ...existingFaq, ...updateFaqDto };

      userService.getUserRecord.mockResolvedValueOnce({ user_type: UserType.SUPER_ADMIN });
      faqsRepository.findOneBy.mockResolvedValueOnce(existingFaq);
      faqsRepository.save.mockResolvedValueOnce(updatedFaq);

      const result = await service.updateFaqs(updateFaqDto, 'faqId', 'userId');

      expect(result).toEqual({ message: 'FAQ updated successfully', status_code: 200, data: updatedFaq });
    });

    it('should throw NotFoundException if FAQ not found', async () => {
      userService.getUserRecord.mockResolvedValueOnce({ user_type: UserType.SUPER_ADMIN });
      faqsRepository.findOneBy.mockResolvedValueOnce(null); // FAQ not found

      await expect(
        service.updateFaqs({ question: 'Updated Question' } as UpdateFaqDto, 'faqId', 'userId')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
