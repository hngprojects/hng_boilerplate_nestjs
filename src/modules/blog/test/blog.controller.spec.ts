import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from '../blog.controller';
import { BlogService } from '../blog.service';
import { Blog } from '../entities/blog.entity';

describe('BlogController', () => {
  let controller: BlogController;
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: {
            findLatest: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findLatest', () => {
    it('should return an array of blogs', async () => {
      const result: Blog[] = [
        new Blog(), // You can mock data here
        new Blog(),
      ];
      jest.spyOn(service, 'findLatest').mockResolvedValue(result);

      expect(await controller.findLatest()).toBe(result);
    });
  });
});
