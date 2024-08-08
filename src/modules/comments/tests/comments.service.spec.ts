import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../entities/comments.entity';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { HttpStatus } from '@nestjs/common';

const mockCommentRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: ReturnType<typeof mockCommentRepository>;
  let userRepository: ReturnType<typeof mockUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useFactory: mockCommentRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get(getRepositoryToken(Comment));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('addComment', () => {
    it('should throw CustomHttpException if comment is empty', async () => {
      const createCommentDto = { model_id: '1', model_type: 'post', comment: '' };

      await expect(service.addComment(createCommentDto, 'user-id')).rejects.toThrow(CustomHttpException);
      await expect(service.addComment(createCommentDto, 'user-id')).rejects.toMatchObject({
        message: 'Comment cannot be empty',
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw CustomHttpException if user is not found', async () => {
      const createCommentDto = { model_id: '1', model_type: 'post', comment: 'A valid comment' };
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.addComment(createCommentDto, 'user-id')).rejects.toThrow(CustomHttpException);
      await expect(service.addComment(createCommentDto, 'user-id')).rejects.toMatchObject({
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should add a comment successfully', async () => {
      const createCommentDto = { model_id: '1', model_type: 'post', comment: 'A valid comment' };
      const mockUser = { id: 'user-id', first_name: 'John', last_name: 'Doe' };
      const mockComment = { id: 'comment-id', model_id: '1', model_type: 'post', comment: 'A valid comment' };

      userRepository.findOne.mockResolvedValue(mockUser);
      commentRepository.create.mockReturnValue(mockComment);
      commentRepository.save.mockResolvedValue(mockComment);

      const result = await service.addComment(createCommentDto, 'user-id');

      expect(result).toEqual({
        message: 'Comment added successfully!',
        savedComment: mockComment,
        commentedBy: 'John Doe',
      });
    });
  });
});
