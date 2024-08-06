import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { HttpStatus } from '@nestjs/common';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    create: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user-id' },
  };

  const createCommentDto: CreateCommentDto = {
    content: 'This is a test comment',
    author: 'entity-id',
    blog_id: 'blog',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment and return the created comment', async () => {
      const mockComment = {
        status: HttpStatus.CREATED,
        message: 'Comment created successfully',
        data: { content: 'This is a test comment', author: 'entity-id', blog_id: 'blog' },
      };

      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create(createCommentDto, mockRequest);
      expect(result).toEqual(mockComment);
      expect(service.create).toHaveBeenCalledWith(createCommentDto, mockRequest.user);
    });

    it('should return an error if the service fails', async () => {
      const mockErrorResponse = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating comment',
      };

      mockCommentsService.create.mockResolvedValue(mockErrorResponse);

      const result = await controller.create(createCommentDto, mockRequest);
      expect(result).toEqual(mockErrorResponse);
      expect(service.create).toHaveBeenCalledWith(createCommentDto, mockRequest.user);
    });
  });
});
