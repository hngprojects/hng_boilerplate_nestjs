import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import WaitlistPageService from '../waitlist-pages.service';
import { WaitlistPage } from '../entities/waitlist-page.entity';
import { CreateWaitlistPageDTO } from '../dto/create-waitlist-page.dto';

describe('WaitlistPageService', () => {
  let service: WaitlistPageService;
  let repository: Repository<WaitlistPage>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistPageService,
        {
          provide: getRepositoryToken(WaitlistPage),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WaitlistPageService>(WaitlistPageService);
    repository = module.get<Repository<WaitlistPage>>(getRepositoryToken(WaitlistPage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWaitlistPage', () => {
    it('should create a waitlist page successfully', async () => {
      const dto: CreateWaitlistPageDTO = {
        page_title: 'Test Page',
        url_slug: 'test-page',
        headline_text: 'Test Headline',
        sub_headline_text: 'Test Subheadline',
        body_text: 'Test Body',
        image_url: 'http://test.com/image.jpg',
        status: false,
      };

      const savedWaitlistPage = { ...dto, id: 1 };

      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue(savedWaitlistPage);

      const result = await service.createWaitlistPage(dto);

      expect(result).toEqual({
        status: 'Success',
        status_code: HttpStatus.CREATED,
        message: 'Waitlist page created successfully',
        data: {
          waitlist: savedWaitlistPage,
        },
      });

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(dto);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const dto: CreateWaitlistPageDTO = {
        page_title: 'Test Page',
        url_slug: 'test-page',
        headline_text: 'Test Headline',
        sub_headline_text: 'Test Subheadline',
        body_text: 'Test Body',
        image_url: 'http://test.com/image.jpg',
        status: false,
      };

      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createWaitlistPage(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAllWaitlistPages', () => {
    it('should return all waitlist pages with pagination', async () => {
      const mockWaitlistPages = [
        { id: 1, page_title: 'Page 1', url_slug: 'page-1', status: 'active', created_at: new Date() },
        { id: 2, page_title: 'Page 2', url_slug: 'page-2', status: 'inactive', created_at: new Date() },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockWaitlistPages, 2]);
      mockRepository.find.mockResolvedValue(mockWaitlistPages);

      const result = await service.getAllWaitlistPages(1, 10);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        status: 'Success',
        message: 'Waitlist pages retrieved successfully',
        data: {
          waitlistPages: mockWaitlistPages,
        },
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        select: ['id', 'page_title', 'url_slug', 'status', 'created_at'],
        skip: 0,
        take: 10,
        order: { created_at: 'DESC' },
      });
    });

    it('should handle pagination correctly', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      mockRepository.find.mockResolvedValue([]);

      await service.getAllWaitlistPages(2, 5);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        select: ['id', 'page_title', 'url_slug', 'status', 'created_at'],
        skip: 5,
        take: 5,
        order: { created_at: 'DESC' },
      });
    });
  });
});
