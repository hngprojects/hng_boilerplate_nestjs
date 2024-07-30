import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateFaqDto } from './create-faq.dto';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';

describe('FaqController (e2e)', () => {
  let app;
  let server;
  let faqService: FaqService;

  const mockFaqService = {
    create: jest.fn().mockImplementation((createFaqDto: CreateFaqDto, createdBy: string) => {
      return {
        id: 'some-uuid',
        ...createFaqDto,
        createdBy,
        createdAt: new Date().toISOString(),
      };
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [
        {
          provide: FaqService,
          useValue: mockFaqService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    faqService = moduleFixture.get<FaqService>(FaqService);
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /faqs', () => {
    it('should create a new FAQ', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'What is the return policy?',
        answer: 'Our return policy allows returns within 30 days of purchase.',
        category: 'Policies',
        tags: ['return', 'policy', 'purchase'],
      };

      const response = await request(server).post('/faqs').send(createFaqDto).expect(201);

      expect(response.body).toEqual({
        status_code: 201,
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          question: createFaqDto.question,
          answer: createFaqDto.answer,
          category: createFaqDto.category,
          tags: createFaqDto.tags,
          createdBy: 'ADMIN',
          createdAt: expect.any(String),
        }),
      });
    });

    it('should return 500 if there is an unexpected error', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'What is the return policy?',
        answer: 'Our return policy allows returns within 30 days of purchase.',
        category: 'Policies',
        tags: ['return', 'policy', 'purchase'],
      };

      jest.spyOn(faqService, 'create').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(server).post('/faqs').send(createFaqDto).expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
});
