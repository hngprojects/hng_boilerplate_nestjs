import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FaqsService } from '../faqs.service';
import { Faqs } from '../entities/faqs.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateFaqDto } from '../dto/createFaqsDto';
import { BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import UserService from '../../../modules/user/user.service';
import { UserType } from '../../../modules/organisations/tests/mocks/organisation.mock';

describe('FaqsService', () => {
  let service: FaqsService;
  let faqsRepository: Repository<Faqs>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqsService,
        UserService,
        {
          provide: getRepositoryToken(Faqs),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<FaqsService>(FaqsService);
    faqsRepository = module.get<Repository<Faqs>>(getRepositoryToken(Faqs));
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw BadRequestException if FAQ already exists', async () => {
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce({ user_type: UserType.ADMIN });
    jest.spyOn(faqsRepository, 'findOneBy').mockResolvedValueOnce({ question: 'Test Question' } as Faqs);

    await expect(service.createFaq({ question: 'Test Question' } as CreateFaqDto, 'userId')).rejects.toThrow(
      BadRequestException
    );
  });

  it('should create and return the new FAQ if valid', async () => {
    const createFaqDto = { question: 'Test Question', answer: 'Test Answer', category: '', tags: '' } as CreateFaqDto;
    const newFaq = createFaqDto as Faqs;

    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce({ user_type: UserType.ADMIN });
    jest.spyOn(faqsRepository, 'findOneBy').mockResolvedValueOnce(null);
    jest.spyOn(faqsRepository, 'create').mockReturnValueOnce(newFaq);
    jest.spyOn(faqsRepository, 'save').mockResolvedValueOnce(newFaq);

    const result = await service.createFaq(createFaqDto, 'userId');

    expect(result).toEqual({ message: 'FAQ created successfully', data: newFaq });
  });
});
