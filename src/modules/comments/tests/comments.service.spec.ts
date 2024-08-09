import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../entities/comments.entity';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

const mockCommentRepository = () => ({
  findOneBy: jest.fn(),
  update: jest.fn(),
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

  describe('updateComment', () => {
    const commentId = 'comment-id';
    const userId = 'user-id';
    const updateCommentDto = { comment: 'Updated comment' };

    it('should throw CustomHttpException if comment is not found', async () => {
      commentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateComment(commentId, userId, updateCommentDto)).rejects.toThrow(CustomHttpException);
      await expect(service.updateComment(commentId, userId, updateCommentDto)).rejects.toMatchObject({
        message: 'Comment not found',
        status: 404,
      });
    });

    it('should throw CustomHttpException if user is not found', async () => {
      commentRepository.findOneBy.mockResolvedValue({ id: commentId, comment: 'Original comment' });
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.updateComment(commentId, userId, updateCommentDto)).rejects.toThrow(CustomHttpException);
      await expect(service.updateComment(commentId, userId, updateCommentDto)).rejects.toMatchObject({
        message: 'User not found',
        status: 404,
      });
    });

    it('should update the comment successfully', async () => {
      const mockUser = { id: userId, first_name: 'John', last_name: 'Doe' };
      const mockComment = { id: commentId, comment: 'Original comment' };
      const updatedComment = { id: commentId, comment: 'Updated comment' };

      commentRepository.findOneBy
        .mockResolvedValueOnce(mockComment) // Initial findOneBy for existing comment
        .mockResolvedValueOnce(updatedComment); // findOneBy after update
      userRepository.findOne.mockResolvedValue(mockUser);
      commentRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateComment(commentId, userId, updateCommentDto);

      expect(result).toEqual({
        message: 'Comment updated successfully!',
        savedComment: updatedComment,
        commentedBy: 'John Doe',
      });
    });
  });
});
