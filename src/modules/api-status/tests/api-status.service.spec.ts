import { Test, TestingModule } from '@nestjs/testing';
import { ApiStatusService } from '../api-status.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiHealth } from '../entities/api-status.entity';
import { Repository } from 'typeorm';
import { CreateApiStatusDto } from '../dto/create-api-status.dto';
import { Request } from '../entities/request.entity';

describe('ApiStatusService', () => {
  let service: ApiStatusService;
  let apiHealthRepository: Repository<ApiHealth>;
  let requestRepository: Repository<Request>;

  const mockApiHealthRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  });

  const mockRequestRepository = () => ({
    save: jest.fn(),
    clear: jest.fn(),
    delete: jest.fn(),
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiStatusService,
        {
          provide: getRepositoryToken(ApiHealth),
          useValue: mockApiHealthRepository(),
        },
        {
          provide: getRepositoryToken(Request),
          useValue: mockRequestRepository(),
        },
      ],
    }).compile();

    service = module.get<ApiStatusService>(ApiStatusService);
    apiHealthRepository = module.get<Repository<ApiHealth>>(getRepositoryToken(ApiHealth));
    requestRepository = module.get<Repository<Request>>(getRepositoryToken(Request));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new ApiHealth and Requests', async () => {
      const createApiStatusDto: CreateApiStatusDto[] = [
        {
          api_group: 'Blogs API 2',
          status: 'operational',
          details: 'All tests passed',
          requests: [],
        },
      ];

      const savedApiHealth = new ApiHealth();
      savedApiHealth.requests = [];

      const savedRequest: Request = {
        id: '1',
        requestName: 'Blog',
        requestUrl: '/api/v1/blog',
        responseTime: 2000,
        errors: ['Hello'],
        status: 'Bad Request',
        statusCode: 400,
        created_at: new Date(),
        updated_at: new Date(),
        api_health: savedApiHealth,
      };

      jest.spyOn(apiHealthRepository, 'findOne').mockResolvedValue(savedApiHealth);
      jest.spyOn(apiHealthRepository, 'save').mockResolvedValue(savedApiHealth);
      jest.spyOn(requestRepository, 'save').mockResolvedValue(savedRequest);

      const result = await service.create(createApiStatusDto);

      expect(apiHealthRepository.findOne).toHaveBeenCalled();
      expect(apiHealthRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Status Added Successfully',
        data: [savedApiHealth],
      });
    });

    describe('create', () => {
      describe('findAll', () => {
        it('should return all ApiHealth records with their requests', async () => {
          const apiHealthData: ApiHealth[] = [
            {
              id: '1',
              api_group: 'Test',
              status: 'operational',
              details: 'All Tests passed',
              requests: [],
              created_at: new Date(),
              updated_at: new Date(),
              lastChecked: new Date(),
            },
            {
              id: '2',
              api_group: 'Test',
              status: 'operational',
              details: 'All Tests passed',
              requests: [],
              created_at: new Date(),
              updated_at: new Date(),
              lastChecked: new Date(),
            },
          ];

          jest.spyOn(apiHealthRepository, 'find').mockResolvedValue(apiHealthData);

          const result = await service.findAll();

          expect(apiHealthRepository.find).toHaveBeenCalledWith({
            relations: ['requests'],
          });
          expect(result).toEqual({
            message: 'Health Status Retrieved Successfully',
            data: apiHealthData,
          });
        });
      });
    });
  });
});
