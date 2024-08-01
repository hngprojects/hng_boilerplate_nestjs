
import { Test, TestingModule } from '@nestjs/testing';
import { HelpCenterService } from './help-center.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { HelpCenterEntity } from './entities/help-center.entity';

describe('HelpCenterService', () => {
  let service: HelpCenterService;
  let repository: Repository<HelpCenterEntity>;

  const mockHelpCenter = {
    id: '1234',
    title: 'Sample Title',
    content: 'Sample Content',
    author: 'ADMIN',
  };

  const mockHelpCenterDto = {
    title: 'Sample Title',
    content: 'Sample Content',
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => ({
      ...dto,
      id: '1234',
    })),
    save: jest.fn().mockResolvedValue(mockHelpCenter),
    find: jest.fn().mockResolvedValue([mockHelpCenter]),
    findOne: jest.fn().mockImplementation((options) =>
      Promise.resolve(options.where.id === '1234' ? mockHelpCenter : null),
    ),
    createQueryBuilder: jest.fn().mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockHelpCenter]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelpCenterService,
        {
          provide: getRepositoryToken(HelpCenterEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<HelpCenterService>(HelpCenterService);
    repository = module.get<Repository<HelpCenterEntity>>(
      getRepositoryToken(HelpCenterEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new help center topic and set author to ADMIN', async () => {
      const result = await service.create(mockHelpCenterDto);
      expect(result).toEqual(mockHelpCenter);
      expect(repository.create).toHaveBeenCalledWith({
        ...mockHelpCenterDto,
        author: 'ADMIN',
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockHelpCenterDto,
        author: 'ADMIN',
        id: '1234',
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of help center topics', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockHelpCenter]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a help center topic by ID', async () => {
      const result = await service.findOne('1234');
      expect(result).toEqual(mockHelpCenter);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1234' } });
    });

    it('should throw a NotFoundException if topic not found', async () => {
      await expect(service.findOne('wrong-id')).rejects.toThrow(
        new NotFoundException('Help center topic with ID wrong-id not found'),
      );
    });
  });

  describe('search', () => {
    it('should return an array of help center topics matching search criteria', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockHelpCenter]),
      };

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.search({ title: 'Sample' });

      expect(result).toEqual([mockHelpCenter]);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('help_center');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'help_center.title LIKE :title',
        { title: '%Sample%' }
      );
    });

    it('should return an array of help center topics matching multiple search criteria', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockHelpCenter]),
      };

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.search({ title: 'Sample', content: 'Sample Content' });

      expect(result).toEqual([mockHelpCenter]);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('help_center');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'help_center.title LIKE :title',
        { title: '%Sample%' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'help_center.content LIKE :content',
        { content: '%Sample Content%' }
      );
    });
  });
});
