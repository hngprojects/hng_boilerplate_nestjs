import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Faqs } from 'src/database/entities/faqs.entity'; // Adjusted to correct path
import { FaqsService } from './faqs.service';
import { Repository } from 'typeorm';
import { CreateFaqDto } from './dto/create-faq.dto'; // Make sure this path is correct

describe('FaqsService', () => {
  let service: FaqsService;
  let repo: Repository<Faqs>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqsService,
        {
          provide: getRepositoryToken(Faqs),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<FaqsService>(FaqsService);
    repo = module.get<Repository<Faqs>>(getRepositoryToken(Faqs));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an FAQ', async () => {
    const createFaqDto: CreateFaqDto = {
      question: 'What is NestJS?',
      answer: 'NestJS is a progressive Node.js framework.',
      category: 'General', // Added the required category field
    };
    const result = { id: '1', ...createFaqDto }; // Mocked result

    jest.spyOn(repo, 'save').mockResolvedValue(result as any);

    expect(await service.create(createFaqDto)).toEqual(result);
  });

  // Add more tests as needed for other methods
});
