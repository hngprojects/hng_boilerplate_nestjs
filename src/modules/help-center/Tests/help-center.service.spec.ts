import { Test, TestingModule } from '@nestjs/testing';
import { HelpCenterService } from '../help-center.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { HelpCenterEntity } from '../entities/help-center.entity';
import { HELP_CENTER_TOPIC_UPDATED,REQUEST_SUCCESSFUL } from '../../../helpers/SystemMessages';
import { User } from '../../user/entities/user.entity';
import { TextService } from '../../translation/translation.service';
import * as SYS_MSG from '../../../helpers/SystemMessages';

class MockTextService {
  translateText(text: string, targetLang: string) {
    return Promise.resolve(text);
  }
}

describe('HelpCenterService', () => {
  let service: HelpCenterService;
  let helpCenterRepository: Repository<HelpCenterEntity>;
  let userRepository: Repository<User>;

  const mockHelpCenter = {
    id: '1234',
    title: 'Sample Title',
    content: 'Sample Content',
    author: 'John Doe',
  };

  const mockHelpCenterDto = {
    title: 'Sample Title',
    content: 'Sample Content',
  };

  const mockUser = {
    id: '123',
    first_name: 'John',
    last_name: 'Doe',
  };

  const mockHelpCenterRepository = {
    create: jest.fn().mockImplementation(dto => ({
      ...dto,
      id: '1234',
    })),
    save: jest.fn().mockResolvedValue(mockHelpCenter),
    find: jest.fn().mockResolvedValue([mockHelpCenter]),
    findOne: jest
      .fn()
      .mockImplementation(options =>
        Promise.resolve(options.where.title === mockHelpCenter.title ? mockHelpCenter : null)
      ),
    createQueryBuilder: jest.fn().mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockHelpCenter]),
    }),
  };

  const mockUserRepository = {
    findOne: jest
      .fn()
      .mockImplementation(options => Promise.resolve(options.where.id === mockUser.id ? mockUser : null)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelpCenterService,
        {
          provide: TextService,
          useClass: MockTextService,
        },
        {
          provide: getRepositoryToken(HelpCenterEntity),
          useValue: mockHelpCenterRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<HelpCenterService>(HelpCenterService);
    helpCenterRepository = module.get<Repository<HelpCenterEntity>>(getRepositoryToken(HelpCenterEntity));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new help center topic with the user as author', async () => {
      mockHelpCenterRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.create(mockHelpCenterDto, mockUser as unknown as User);
      const responseBody = {
        status_code: 201,
        message: 'Request successful',
        data: { ...mockHelpCenterDto, author: 'John Doe', id: '1234' },
      };

      expect(result).toEqual(responseBody);
      expect(helpCenterRepository.create).toHaveBeenCalledWith({
        ...mockHelpCenterDto,
        author: 'John Doe',
      });
      expect(helpCenterRepository.save).toHaveBeenCalledWith({
        ...mockHelpCenterDto,
        author: 'John Doe',
        id: '1234',
      });
    });

    it('should throw a BadRequestException if a topic with the same title already exists', async () => {
      mockHelpCenterRepository.findOne.mockResolvedValue(mockHelpCenter);

      await expect(service.create(mockHelpCenterDto, mockUser as unknown as User)).rejects.toThrow(
        new BadRequestException('This question already exists.')
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of help center topics', async () => {
      const result = await service.findAll();
      const responseBody = {
        data: [mockHelpCenter],
        status_code: 200,
        message: REQUEST_SUCCESSFUL,
      };
      expect(result).toEqual(responseBody);
      expect(helpCenterRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a help center topic by ID', async () => {
      const result = await service.findOne('1234');
      const responseBody = {
        data: mockHelpCenter,
        status_code: 200,
        message: REQUEST_SUCCESSFUL,
      };
      expect(result).toEqual(responseBody);
      expect(helpCenterRepository.findOne).toHaveBeenCalledWith({ where: { id: '1234' } });
    });

    it('should throw a NotFoundException if topic not found', async () => {
      mockHelpCenterRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('wrong-id')).rejects.toThrow(
        new NotFoundException('Help center topic with ID wrong-id not found')
      );
    });
  });

  describe('search', () => {
    it('should return an array of help center topics matching search criteria', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockHelpCenter]),
      };

      jest.spyOn(helpCenterRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.search({ title: 'Sample' });
      const responseBody = {
        status_code: 200,
        message: REQUEST_SUCCESSFUL,
        data: [mockHelpCenter],
      };
      expect(result).toEqual(responseBody);
      expect(helpCenterRepository.createQueryBuilder).toHaveBeenCalledWith('help_center');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('help_center.title LIKE :title', { title: '%Sample%' });
    });

    it('should return an array of help center topics matching multiple search criteria', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockHelpCenter]),
      };

      jest.spyOn(helpCenterRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.search({ title: 'Sample', content: 'Sample Content' });
      const responseBody = {
        status_code: 200,
        message: REQUEST_SUCCESSFUL,
        data: [mockHelpCenter],
      };
      expect(result).toEqual(responseBody);
      expect(helpCenterRepository.createQueryBuilder).toHaveBeenCalledWith('help_center');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('help_center.title LIKE :title', { title: '%Sample%' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('help_center.content LIKE :content', {
        content: '%Sample Content%',
      });
    });
  });
});
