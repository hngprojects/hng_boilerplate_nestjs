import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FaqsService } from '../faqs.service';
import { Faqs } from '../entities/faqs.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateFaqDto } from '../dto/createFaqsDto';
import { BadRequestException } from '@nestjs/common';

describe('FaqsService', () => {
  let service: FaqsService;
  let faqsRepository: Repository<Faqs>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqsService,
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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw BadRequestException if FAQ already exists', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce({ user_type: 'admin' } as User);
    jest.spyOn(faqsRepository, 'findOneBy').mockResolvedValueOnce({ question: 'Test Question' } as Faqs);

    await expect(service.createFaq({ question: 'Test Question' } as CreateFaqDto, 'userId')).rejects.toThrow(
      BadRequestException
    );
  });

  it('should create and return the new FAQ if valid', async () => {
    const user = { user_type: 'admin' } as User;
    const createFaqDto = { question: 'Test Question', answer: 'Test Answer' } as CreateFaqDto;
    const newFaq = createFaqDto as Faqs;

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);
    jest.spyOn(faqsRepository, 'findOneBy').mockResolvedValueOnce(null);
    jest.spyOn(faqsRepository, 'create').mockReturnValueOnce(newFaq);
    jest.spyOn(faqsRepository, 'save').mockResolvedValueOnce(newFaq);

    const result = await service.createFaq(createFaqDto, 'userId');

    expect(result).toEqual({ message: 'FAQ created successfully', data: newFaq });
  });
});
