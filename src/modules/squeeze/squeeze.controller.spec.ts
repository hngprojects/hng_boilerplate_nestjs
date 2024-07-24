import { Test, TestingModule } from '@nestjs/testing';
import { SqueezeController } from './squeeze.controller';
import { SqueezeService } from './squeeze.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

const mockSqueezeRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findBy: jest.fn(),
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
    app.useGlobalPipes(new ValidationPipe());
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
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '08098761234',
        location: 'Lagos, Nigeria',
        job_title: 'Software Engineer',
        company: 'X-Corp',
        interests: ['Web Development', 'Cloud Computing'],
        referral_source: 'LinkedIn',
      };

      const squeeze = {
        ...createSqueezeDto,
      };

      mockSqueezeRepository.create.mockReturnValue(squeeze);
      mockSqueezeRepository.save.mockResolvedValue(squeeze);
      mockSqueezeRepository.findBy.mockResolvedValue([]);

      const response = await request(app.getHttpServer()).post('/squeeze').send(createSqueezeDto).expect(201);

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
        job_title: '',
      };

      const response = await request(app.getHttpServer()).post('/squeeze').send(createSqueezeDto).expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });

    it('return return 422 for duplicated email', async () => {
      const squeeze = {
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '08098761234',
        location: 'Lagos, Nigeria',
        job_title: 'Software Engineer',
        company: 'X-Corp',
        interests: ['Web Development', 'Cloud Computing'],
        referral_source: 'LinkedIn',
      };

      mockSqueezeRepository.create.mockReturnValue(squeeze);
      mockSqueezeRepository.save.mockResolvedValue(squeeze);
      mockSqueezeRepository.findBy.mockResolvedValue([squeeze]);

      const response = await request(app.getHttpServer()).post('/squeeze').send(squeeze).expect(422);
      expect(response.body).toHaveProperty('message', 'Squeeze information exists for the provided email');
      expect(response.body).toHaveProperty('status_code', 422);
    });
  });
});
