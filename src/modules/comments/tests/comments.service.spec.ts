import { Test } from '@nestjs/testing';
import { CommentsService } from '../comments.service';
import { Comment } from '../entities/comment.entity';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';

@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

const mockCommentRepository = {
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useClass(MockAuthGuard)
      .compile();

    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add comment', async () => {
    const createCommentDto = {
      model_id: '1',
      model_type: 'test',
      content: 'test comment',
    };
    const userId = '1';

    const user = { id: '1' };
    const savedComment = {
      id: '1',
      ...createCommentDto,
    };

    mockUserRepository.findOne.mockResolvedValue(user);
    mockCommentRepository.create.mockReturnValue(createCommentDto);
    mockCommentRepository.save.mockResolvedValue(savedComment as any);

    expect(await service.addComment(createCommentDto, userId)).toEqual({
      message: 'Comment added successfully!',
      comment: savedComment,
    });
  });

  it('should throw BadRequestException for empty content', async () => {
    const createCommentDto = {
      model_id: '1',
      model_type: 'test',
      content: ' ',
    };
    const userId = '1';

    await expect(service.addComment(createCommentDto, userId)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when user is not found while adding comment', async () => {
    const createCommentDto = {
      model_id: '1',
      model_type: 'test',
      content: 'test comment',
    };
    const userId = '1';

    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.addComment(createCommentDto, userId)).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException when an error occurs while adding comment', async () => {
    const createCommentDto = {
      model_id: '1',
      model_type: 'test',
      content: 'test comment',
    };
    const userId = '1';

    mockUserRepository.findOne.mockResolvedValue({ id: '1' });
    mockCommentRepository.create.mockReturnValue(createCommentDto);
    mockCommentRepository.save.mockRejectedValue(new Error('Unexpected error'));

    await expect(service.addComment(createCommentDto, userId)).rejects.toThrow(InternalServerErrorException);
  });

  it('should update comment', async () => {
    const updateCommentDto = {
      content: 'updated comment',
    };
    const commentId = '1';
    const userId = '1';

    const existingComment = { id: commentId, content: 'old comment' };
    const updatedComment = {
      id: commentId,
      ...updateCommentDto,
    };

    mockCommentRepository.findOneBy.mockResolvedValue(existingComment as any);
    mockUserRepository.findOne.mockResolvedValue({ id: userId });
    mockCommentRepository.update.mockResolvedValue(undefined);
    mockCommentRepository.findOneBy.mockResolvedValue(updatedComment as any);

    expect(await service.updateComment(commentId, userId, updateCommentDto)).toEqual({
      message: 'Comment updated successfully!',
      comment: updatedComment,
    });
  });

  it('should throw NotFoundException when comment is not found while updating', async () => {
    const updateCommentDto = {
      content: 'updated comment',
    };
    const commentId = '1';
    const userId = '1';

    mockCommentRepository.findOneBy.mockResolvedValue(null);

    await expect(service.updateComment(commentId, userId, updateCommentDto)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when user is not found while updating comment', async () => {
    const updateCommentDto = {
      content: 'updated comment',
    };
    const commentId = '1';
    const userId = '1';

    const existingComment = { id: commentId, content: 'old comment' };

    mockCommentRepository.findOneBy.mockResolvedValue(existingComment as any);
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.updateComment(commentId, userId, updateCommentDto)).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException when an error occurs while updating comment', async () => {
    const updateCommentDto = {
      content: 'updated comment',
    };
    const commentId = '1';
    const userId = '1';

    const existingComment = { id: commentId, content: 'old comment' };

    mockCommentRepository.findOneBy.mockResolvedValue(existingComment as any);
    mockUserRepository.findOne.mockResolvedValue({ id: userId });
    mockCommentRepository.update.mockRejectedValue(new Error('Unexpected error'));

    await expect(service.updateComment(commentId, userId, updateCommentDto)).rejects.toThrow(
      InternalServerErrorException
    );
  });
});
