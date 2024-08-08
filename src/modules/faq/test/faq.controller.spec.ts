import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { FaqService } from '../faq.service';
import { FaqController } from '../faq.controller';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { IFaq, ICreateFaqResponse } from '../faq.interface';
import { User, UserType } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SuperAdminGuard } from '../../../guards/super-admin.guard';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { Role } from '../../../modules/role/entities/role.entity';
import { OrganisationUserRole } from '../../../modules/role/entities/organisation-user-role.entity';
import { Repository } from 'typeorm';

describe('FaqController (e2e)', () => {
  let app;
  let server;
  let faqService: FaqService;

  const mockFaqService = {
    create: jest.fn().mockImplementation((createFaqDto: CreateFaqDto): IFaq => {
      return {
        id: 'some-uuid',
        ...createFaqDto,
        createdBy: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      };
    }),
  };

  const mockUserRepository = {
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      return Promise.resolve({
        id,
        // user_type: UserType.SUPER_ADMIN,
      });
    }),
  };

  const mockSuperAdminGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  const mockOrganisationRepository = {
    findOne: jest.fn().mockImplementation(({ where: { id } }) => {
      return Promise.resolve({
        id,
        owner: { id: 'owner-id' },
      });
    }),
  };

  const mockOrganisationUserRoleRepository = {
    findOne: jest.fn().mockImplementation(({ where: { organisationId, userId } }) => {
      return Promise.resolve({
        role: {
          id: 'role-id',
          permissions: [{ title: 'super-admin' }],
        },
      });
    }),
  };

  const mockRoleRepository = {
    findOne: jest.fn().mockImplementation(({ where: { name } }) => {
      return Promise.resolve({
        id: 'role-id',
        name,
        permissions: [{ title: 'super-admin' }],
      });
    }),
  };

  const mockUser = {
    sub: 'user-id',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [
        {
          provide: FaqService,
          useValue: mockFaqService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useValue: mockOrganisationRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(OrganisationUserRole),
          useValue: mockOrganisationUserRoleRepository,
        },
      ],
    })
      .overrideGuard(SuperAdminGuard)
      .useClass(SuperAdminGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    faqService = moduleFixture.get<FaqService>(FaqService);

    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /faqs', () => {
    it('should create a new FAQ', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'What is the return policy?',
        answer: 'Our return policy allows returns within 30 days of purchase.',
        category: 'Policies',
      };

      const response = await request(server).post('/faqs').send(createFaqDto).expect(201);

      const expectedResponse: ICreateFaqResponse = {
        status_code: 201,
        success: true,
        data: {
          id: expect.any(String),
          question: createFaqDto.question,
          answer: createFaqDto.answer,
          category: createFaqDto.category,
          createdBy: 'ADMIN',
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      };

      expect(response.body).toEqual(expectedResponse);
    });

    it('should return 400 if question is missing', async () => {
      const createFaqDto = {
        answer: 'Our return policy allows returns within 30 days of purchase.',
        category: 'Policies',
      };

      const response = await request(server).post('/faqs').send(createFaqDto).expect(400);

      expect(response.body.message).toContain('Question is required');
    });

    it('should return 400 if answer is missing', async () => {
      const createFaqDto = {
        question: 'What is the return policy?',
        category: 'Policies',
      };

      const response = await request(server).post('/faqs').send(createFaqDto).expect(400);

      expect(response.body.message).toContain('Answer is required');
    });

    it('should return 500 if there is an unexpected error', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'What is the return policy?',
        answer: 'Our return policy allows returns within 30 days of purchase.',
        category: 'Policies',
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
