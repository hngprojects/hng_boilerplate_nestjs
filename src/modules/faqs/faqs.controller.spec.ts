import { Test, TestingModule } from '@nestjs/testing';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';

describe('FaqsController', () => {
  let controller: FaqsController;
  let service: FaqsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqsController],
      providers: [
        {
          provide: FaqsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FaqsController>(FaqsController);
    service = module.get<FaqsService>(FaqsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an FAQ', async () => {
    const createFaqDto = { question: 'Question', answer: 'Answer', category: 'Category' };
    jest.spyOn(service, 'create').mockResolvedValue(createFaqDto as any);

    expect(await controller.create(createFaqDto)).toEqual(createFaqDto);
  });

  it('should return all FAQs', async () => {
    const result = [{ question: 'Question', answer: 'Answer', category: 'Category' }];
    jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

    expect(await controller.findAll()).toEqual(result);
  });

  // Add tests for update and remove methods
});
