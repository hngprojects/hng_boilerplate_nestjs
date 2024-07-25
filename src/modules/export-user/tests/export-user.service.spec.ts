import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ExportUserService } from '../export-user.service';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ExportService', () => {
  let service: ExportUserService;
  let repository: Repository<User>;

  const mockUserRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportUserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
      ],
    }).compile();

    service = module.get<ExportUserService>(ExportUserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserData', () => {
    it('should return a user with related organisations', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.first_name = 'John';
      mockUser.last_name = 'Doe';
      mockUser.email = 'john.doe@example.com';
      mockUser.owned_organisations = [];
      mockUser.created_organisations = [];

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getUserData('123');
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['owned_organisations', 'created_organisations'],
      });
    });
  });

  describe('exportToJson', () => {
    it('should return JSON string of user object', async () => {
      const mockUser = new User();
      mockUser.id = '123';
      mockUser.first_name = 'John';
      mockUser.last_name = 'Doe';
      mockUser.email = 'john.doe@example.com';

      const result = await service.exportToJson(mockUser);
      expect(result).toBe(JSON.stringify(mockUser));
    });
  });
});