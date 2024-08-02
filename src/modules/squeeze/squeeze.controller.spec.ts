import { Test, TestingModule } from '@nestjs/testing';
import { SqueezeController } from './squeeze.controller';
import { SqueezeService } from './squeeze.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Squeeze } from './entities/squeeze.entity';
import * as request from 'supertest';
import { UpdateSqueezeDto } from './dto/update-squeeze.dto';

const mockSqueezeRepository = {
  findOneBy: jest.fn(),
  save: jest.fn(),
};

describe('SqueezeController - update', () => {
  let controller: SqueezeController;
  let app: INestApplication;
  let service: SqueezeService;

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

  describe('PUT /squeeze', () => {
    it('should respond with 400 because email address is not provided/invalid', async () => {
      const reqBody = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '08098761234',
        location: 'Lagos, Nigeria',
        job_title: 'Software Engineer',
        company: 'X-Corp',
        interests: ['Web Development', 'Cloud Computing'],
        referral_source: 'LinkedIn',
      };
      const response = await request(app.getHttpServer()).put('/squeeze').send(reqBody).expect(400);
    });

    it("should respond with 404 because there's no record with the email address provided", async () => {
      const squeezeDto: UpdateSqueezeDto = {
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

      const updateSqueeze = {
        ...squeezeDto,
        phone: '0123456789',
      };

      mockSqueezeRepository.findOneBy.mockResolvedValue(null);
      mockSqueezeRepository.save.mockResolvedValue(updateSqueeze);

      const response = await request(app.getHttpServer()).put('/squeeze').send(updateSqueeze).expect(404);
      expect(response.body).toHaveProperty('status_code', 404);
    });

    it('should forbid the user from updating the record - respond with 403', async () => {
      const squeezeDto: UpdateSqueezeDto = {
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
        id: 'b0337a38-45ec-43e9-87ff-b85af31dcca5',
        ...squeezeDto,
      };

      const updateSqueeze = {
        ...squeeze,
        phone: '0123456789',
      };

      const findOneByMockValue = {
        ...squeeze,
        created_at: new Date(),
        updated_at: new Date(Date.now() + 60 * 60 * 24),
      };

      mockSqueezeRepository.findOneBy.mockResolvedValue(findOneByMockValue);

      const response = await request(app.getHttpServer())
        .put('/squeeze')
        .send({ ...updateSqueeze })
        .expect(403);
      expect(response.body).toHaveProperty('status_code', 403);
    });

    it('should create update the record - respond with 200', async () => {
      const squeezeDto: UpdateSqueezeDto = {
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
        id: 'b0337a38-45ec-43e9-87ff-b85af31dcca5',
        ...squeezeDto,
      };

      const now = Date.now();

      const findOneByMockValue = {
        ...squeeze,
        created_at: new Date(now),
        updated_at: new Date(now),
      };

      const updateSqueeze = {
        ...squeezeDto,
        phone: '1234567890',
      };

      const saveMockValue = {
        ...findOneByMockValue,
        ...updateSqueeze,
        updated_at: new Date(now + 200),
      };

      mockSqueezeRepository.findOneBy.mockResolvedValue(findOneByMockValue);
      mockSqueezeRepository.save.mockResolvedValue(saveMockValue);

      const response = await request(app.getHttpServer()).put('/squeeze').send(updateSqueeze).expect(200);
      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      expect(Date.parse(data.updated_at)).toBeGreaterThan(Date.parse(data.created_at));
    });
  });
});
