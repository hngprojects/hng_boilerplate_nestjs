import { Repository } from 'typeorm';
import { SqueezePagesService } from '../squeeze-pages.service';
import { SqueezePage } from '../entities/squeeze-pages.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSqueezePageDto } from '../dto/create-squeeze-pages.dto';
import { mock } from 'node:test';
import { UpdateSqueezePageDto } from '../dto/update-squeeze-pages.dto';

describe('SqueezePaagesService', () => {
  let squeezePagesService: SqueezePagesService;
  let repository: Repository<SqueezePage>;

  const mockSqueezePageRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqueezePagesService,
        {
          provide: 'SqueezePageRepository',
          useValue: mockSqueezePageRepository,
        },
      ],
    }).compile();

    squeezePagesService = module.get<SqueezePagesService>(SqueezePagesService);
    repository = module.get<Repository<SqueezePage>>(getRepositoryToken(SqueezePage));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(squeezePagesService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new squeeze page', async () => {
      const createSqueezePageDto: CreateSqueezePageDto = {
        page_title: 'Test Squeeze Page',
        url_slug: 'test-squeeze-page',
        headline: 'Test Squeeze Page Content',
        sub_headline: 'Test Squeeze Page Subheadline',
        body: 'Test Squeeze Page Body',
        image: 'test-squeeze-page.jpg',
      };

      const squeezePage = new SqueezePage();
      Object.assign(squeezePage, createSqueezePageDto);

      mockSqueezePageRepository.save.mockResolvedValue(squeezePage);

      const result = await squeezePagesService.create(createSqueezePageDto);

      expect(mockSqueezePageRepository.save).toHaveBeenCalledWith(squeezePage);
      expect(result).toEqual({
        status: 'success',
        status_code: 201,
        message: 'Squeeze Page created successfully.',
        data: {
          squeeze_page: squeezePage,
        },
      });
    });
  });

  describe('findUriSlugs', () => {
    it('should return all uri slugs', async () => {
      const squeezePagesSlug: Partial<SqueezePage>[] = [
        { url_slug: 'test-squeeze-page' },
        { url_slug: 'test-squeeze-page-2' },
      ];

      mockSqueezePageRepository.find.mockResolvedValue(squeezePagesSlug);

      const result = await squeezePagesService.findUriSlugs();

      expect(mockSqueezePageRepository.find).toHaveBeenCalledWith({ select: ['url_slug'] });
      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        message: 'Squeeze Pages retrieved successfully.',
        data: {
          squeeze_pages_slug_uri: squeezePagesSlug.map(squeezePage => squeezePage.url_slug),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all squeeze pages', async () => {
      const squeezePages: SqueezePage[] = [
        {
          id: 'valid-id-1',
          page_title: 'Test Squeeze Page',
          url_slug: 'test-squeeze-page',
          headline: 'Test Squeeze Page Content',
          sub_headline: 'Test Squeeze Page Subheadline',
          body: 'Test Squeeze Page Body',
          image: 'test-squeeze-page.jpg',
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'valid-id-2',
          page_title: 'Test Squeeze Page 2',
          url_slug: 'test-squeeze-page-2',
          headline: 'Test Squeeze Page Content 2',
          sub_headline: 'Test Squeeze Page Subheadline 2',
          body: 'Test Squeeze Page Body 2',
          image: 'test-squeeze-page-2.jpg',
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSqueezePageRepository.findAndCount.mockResolvedValue([squeezePages, squeezePages.length]);

      const result = await squeezePagesService.findAll();

      expect(mockSqueezePageRepository.findAndCount).toHaveBeenCalled();

      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        message: 'Squeeze Pages retrieved successfully.',
        data: {
          squeeze_pages: squeezePages,
          total: squeezePages.length,
        },
      });
    });
  });

  describe('findPaginated', () => {
    it('should return paginated squeeze pages', async () => {
      const pageNumber = 1;
      const limit = 10;
      const squeezePages: SqueezePage[] = [
        {
          id: 'valid-id-1',
          page_title: 'Test Squeeze Page',
          url_slug: 'test-squeeze-page',
          headline: 'Test Squeeze Page Content',
          sub_headline: 'Test Squeeze Page Subheadline',
          body: 'Test Squeeze Page Body',
          image: 'test-squeeze-page.jpg',
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'valid-id-2',
          page_title: 'Test Squeeze Page 2',
          url_slug: 'test-squeeze-page-2',
          headline: 'Test Squeeze Page Content 2',
          sub_headline: 'Test Squeeze Page Subheadline 2',
          body: 'Test Squeeze Page Body 2',
          image: 'test-squeeze-page-2.jpg',
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSqueezePageRepository.findAndCount.mockResolvedValue([squeezePages, squeezePages.length]);

      const result = await squeezePagesService.findPaginated(pageNumber, limit);

      expect(mockSqueezePageRepository.findAndCount).toHaveBeenCalledWith({
        skip: (pageNumber - 1) * limit,
        take: limit,
      });

      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        message: 'Squeeze Pages retrieved successfully.',
        data: {
          squeeze_pages: squeezePages,
          total: squeezePages.length,
        },
      });
    });
  });

  describe('findByTitle', () => {
    it('should return a single squeeze page by title', async () => {
      const title = 'Test Squeeze Page';
      const squeezePage: SqueezePage = {
        id: 'valid-id-1',
        page_title: title,
        url_slug: 'test-squeeze-page',
        headline: 'Test Squeeze Page Content',
        sub_headline: 'Test Squeeze Page Subheadline',
        body: 'Test Squeeze Page Body',
        image: 'test-squeeze-page.jpg',
        status: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSqueezePageRepository.findAndCount.mockResolvedValue([squeezePage, 1]);

      const result = await squeezePagesService.findByTitle(title);

      expect(mockSqueezePageRepository.findAndCount).toHaveBeenCalledWith({ where: { page_title: title } });
      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        message: 'Squeeze Pages retrieved successfully.',
        data: {
          squeeze_page: squeezePage,
          total: 1,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a squeeze page', async () => {
      const id = 'valid-id-1';
      const updateSqueezePageDto: UpdateSqueezePageDto = {
        page_title: 'Test Squeeze Page update',
        url_slug: 'test-squeeze-page url update',
        headline: 'Test Squeeze Page Content update',
        sub_headline: 'Test Squeeze Page Subheadline update',
        body: 'Test Squeeze Page Body update',
        image: 'test-squeeze-page.jpg update',
      };

      const squeezePage: SqueezePage = {
        id,
        page_title: 'Test Squeeze Page',
        url_slug: 'test-squeeze-page',
        headline: 'Test Squeeze Page Content',
        sub_headline: 'Test Squeeze Page Subheadline',
        body: 'Test Squeeze Page Body',
        image: 'test-squeeze-page.jpg',
        status: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedSqueezePage: SqueezePage = Object.assign(squeezePage, updateSqueezePageDto);

      mockSqueezePageRepository.findOne.mockResolvedValue(squeezePage);
      mockSqueezePageRepository.save.mockResolvedValue(updatedSqueezePage);
      const result = await squeezePagesService.update(id, updateSqueezePageDto);

      expect(mockSqueezePageRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockSqueezePageRepository.save).toHaveBeenCalledWith(updatedSqueezePage);
      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        message: 'Squeeze Page updated successfully.',
        data: {
          squeeze_page: updatedSqueezePage,
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a squeeze page', async () => {
      const id = 'valid-id-1';
      const squeezePage: SqueezePage = {
        id,
        page_title: 'Test Squeeze Page',
        url_slug: 'test-squeeze-page',
        headline: 'Test Squeeze Page Content',
        sub_headline: 'Test Squeeze Page Subheadline',
        body: 'Test Squeeze Page Body',
        image: 'test-squeeze-page.jpg',
        status: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSqueezePageRepository.findOne.mockResolvedValue(squeezePage);
      mockSqueezePageRepository.remove.mockResolvedValue(squeezePage);

      const result = await squeezePagesService.remove(id);

      expect(mockSqueezePageRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockSqueezePageRepository.remove).toHaveBeenCalledWith(squeezePage);
      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        message: 'Squeeze Page removed successfully.',
      });
    });
  });
});
