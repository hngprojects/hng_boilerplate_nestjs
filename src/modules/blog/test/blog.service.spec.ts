import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from '../blog.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';

describe('BlogService', () => {
  let service: BlogService;
  let repository: Repository<Blog>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getRepositoryToken(Blog),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    repository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findLatest', () => {
    it('should return an array of blogs', async () => {
      const result: Blog[] = [
        new Blog(), // You can mock data here
        new Blog(),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findLatest()).toBe(result);
    });

    it('should return an array of blogs with a specified limit', async () => {
      const result: Blog[] = [new Blog(), new Blog()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findLatest(2)).toBe(result);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 2,
      });
    });
  });
});
