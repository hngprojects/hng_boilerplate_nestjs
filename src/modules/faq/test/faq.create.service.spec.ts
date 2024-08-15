import { Test, TestingModule } from '@nestjs/testing';
import { FaqService } from '../faq.service';
import { Repository } from 'typeorm';
import { Faq } from '../entities/faq.entity';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TextService } from '../../../translation/translation.service';


class MockTextService {
  translateText(text: string, targetLang: string) {
    return Promise.resolve(text);
  }
}

describe('FaqService', () => {
  let service: FaqService;
  let repository: Repository<Faq>;

  const mockFaqRepository = {
    create: jest.fn().mockImplementation((createFaqDto: CreateFaqDto) => ({
      ...createFaqDto,
      id: 'some-uuid',
      createdBy: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date(),
    })),
    save: jest.fn().mockImplementation(faq => Promise.resolve(faq)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: TextService,
          useClass: MockTextService,
        },
        {
          provide: getRepositoryToken(Faq),
          useValue: mockFaqRepository,
        },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);
    repository = module.get<Repository<Faq>>(getRepositoryToken(Faq));
  });

  describe('create', () => {
    it('should create a new FAQ and return it with createdBy set to ADMIN', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'What is the return policy?',
        answer: 'Our return policy allows returns within 30 days of purchase.',
        category: 'Policies',
      };

      const result = await service.create(createFaqDto);

      expect(result).toEqual({
        id: 'some-uuid',
        ...createFaqDto,
        createdBy: 'ADMIN',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(mockFaqRepository.create).toHaveBeenCalledWith(createFaqDto);
      expect(mockFaqRepository.save).toHaveBeenCalledWith({
        id: 'some-uuid',
        ...createFaqDto,
        createdBy: 'ADMIN',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it('should throw an error if saving fails', async () => {
      jest.spyOn(mockFaqRepository, 'save').mockRejectedValueOnce(new Error('Database error'));

      const createFaqDto: CreateFaqDto = {
        question: 'What is the return policy?',
        answer: 'Our return policy allows returns within 30 days of purchase.',
        category: 'Policies',
      };

      await expect(service.create(createFaqDto)).rejects.toThrow('Database error');
    });
  });
});
