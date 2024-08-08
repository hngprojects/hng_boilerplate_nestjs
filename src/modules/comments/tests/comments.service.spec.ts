import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../entities/comments.entity';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

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
    it('should throw BadRequestException if comment is empty', async () => {
      const dto = { model_id: '1', model_type: 'post', comment: '' };

      await expect(service.addComment(dto, 'user-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const dto = { model_id: '1', model_type: 'post', comment: 'Great post!' };
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.addComment(dto, 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should successfully add a comment', async () => {
      const dto = { model_id: '1', model_type: 'post', comment: 'Great post!' };
      const mockUser = { id: 'user-id', first_name: 'John', last_name: 'Doe' };
      const mockComment = { id: 'comment-id', model_id: '1', model_type: 'post', comment: 'Great post!' };

      userRepository.findOne.mockResolvedValue(mockUser);
      commentRepository.create.mockReturnValue(mockComment);
      commentRepository.save.mockResolvedValue(mockComment);

      const result = await service.addComment(dto, 'user-id');
      expect(result).toEqual({
        message: 'Comment added successfully!',
        savedComment: mockComment,
        commentedBy: 'John Doe',
      });
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      const dto = { model_id: '1', model_type: 'post', comment: 'Great post!' };
      const mockUser = { id: 'user-id', first_name: 'John', last_name: 'Doe' };

      userRepository.findOne.mockResolvedValue(mockUser);
      commentRepository.create.mockReturnValue({});
      commentRepository.save.mockRejectedValue(new Error('Some error'));

      await expect(service.addComment(dto, 'user-id')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
