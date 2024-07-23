import { Test, TestingModule } from '@nestjs/testing';
import { SqueezeController } from './squeeze.controller';
import { SqueezeService } from './squeeze.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const mockSqueezeRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('SqueezeController', () => {
  let controller: SqueezeController;
  let service: SqueezeService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SqueezeController],
      providers: [
        SqueezeService,
        {
          provide: getRepositoryToken(Squeeze),
          useValue: mockSqueezeRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<SqueezeController>(SqueezeController);
    service = module.get<SqueezeService>(SqueezeService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /squeeze', () => {
    it('should successfully insert a squeeze record', async () => {
      const createSqueezeDto = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
        location: 'Test Location',
        company: 'Test Company',
        referral_source: 'Test Source',
        interests: ['Interest1', 'Interest2'],
        job_title: 'Software Engineer',
      };

      const squeeze = {
        ...createSqueezeDto,
      };

      mockSqueezeRepository.create.mockReturnValue(squeeze);
      mockSqueezeRepository.save.mockResolvedValue(squeeze);

      const response = await request(app.getHttpServer()).post('/squeezes').send(createSqueezeDto).expect(201);

      expect(response.body.message).toContain('Your request has been received. You will get a template shortly.');
      expect(mockSqueezeRepository.create).toHaveBeenCalledWith(createSqueezeDto);
      expect(mockSqueezeRepository.save).toHaveBeenCalledWith(squeeze);
    });

    it('should return 400 if validation fails', async () => {
      const createSqueezeDto = {
        email: 'invalid-email',
        first_name: '',
        last_name: '',
        phone: '',
        location: '',
        company: '',
        referral_source: '',
        interests: [],
      };

      const response = await request(app.getHttpServer()).post('/squeezes').send(createSqueezeDto).expect(400);

      expect(response.body.message).toContain('Failed to submit your request');
    });
  });
});
