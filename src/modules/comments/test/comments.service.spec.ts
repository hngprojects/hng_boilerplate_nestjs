import { CreateCommentDto } from './../dto/create-comment.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../comments.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../../user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepository: Repository<Comment>;
  let userRepository: Repository<User>;

  const mockCommentsRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentsRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a comment successfully', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
        blog_id: 'entity-id',
        author: 'blog',
      };

      const user = { id: 'user-id' } as User;
      const fullUser = { id: 'user-id', first_name: 'John', last_name: 'Doe' } as User;
      const savedComment = { id: user.id, author: fullUser, content: createCommentDto.content } as Comment;

      mockUserRepository.findOne.mockResolvedValue(fullUser);
      mockCommentsRepository.create.mockReturnValue(savedComment);
      mockCommentsRepository.save.mockResolvedValue(savedComment);

      const result = await service.create(createCommentDto, user);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
        select: ['first_name', 'last_name'],
      });
      expect(mockCommentsRepository.create).toHaveBeenCalledWith({
        ...createCommentDto,
        author: fullUser,
      });
      expect(mockCommentsRepository.save).toHaveBeenCalledWith(savedComment);
      expect(result).toEqual({
        status: HttpStatus.CREATED,
        message: 'Comment created successfully',
        data: { comment: savedComment },
      });
    });

    it('should return an error if the user is not found', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
        blog_id: 'entity-id',
        author: 'blog',
      };

      const user = { id: 'user-id' } as User;

      mockUserRepository.findOne.mockResolvedValue(null);

      try {
        await service.create(createCommentDto, user);
      } catch (error) {
        expect(error.response).toEqual('User not found');
        expect(error.status).toEqual(404);
      }

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
        select: ['first_name', 'last_name'],
      });
      expect(mockCommentsRepository.create).not.toHaveBeenCalled();
      expect(mockCommentsRepository.save).not.toHaveBeenCalled();
    });

    it('should handle errors and return an internal server error response', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
        blog_id: 'entity-id',
        author: 'blog',
      };

      const user = { id: 'user-id' } as User;

      mockUserRepository.findOne.mockRejectedValue(new Error('Something went wrong'));

      const result = await service.create(createCommentDto, user);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
        select: ['first_name', 'last_name'],
      });
      expect(mockCommentsRepository.create).not.toHaveBeenCalled();
      expect(mockCommentsRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating comment',
      });
    });
  });
});
