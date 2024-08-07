import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../comments.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../../user/entities/user.entity';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;
  let userRepository: Repository<User>;

  const mockCommentRepository = {
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
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw a BadRequestException if the content is empty', async () => {
    await expect(service.addComment({ model_id: '1', model_type: 'blog', content: '' }, 'user-id')).rejects.toThrow(
      BadRequestException
    );
  });

  it('should throw a NotFoundException if the user is not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      service.addComment({ model_id: '1', model_type: 'blog', content: 'Test comment' }, 'user-id')
    ).rejects.toThrow(NotFoundException);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
  });

  it('should return a successful response when the comment is added successfully', async () => {
    const mockUser = { id: 'user-id', first_name: 'John', last_name: 'Doe' };
    const mockComment = { id: 'comment-id', model_id: '1', model_type: 'blog', content: 'Test comment' };

    mockUserRepository.findOne.mockResolvedValue(mockUser);
    mockCommentRepository.create.mockReturnValue(mockComment);
    mockCommentRepository.save.mockResolvedValue(mockComment);

    const result = await service.addComment({ model_id: '1', model_type: 'blog', content: 'Test comment' }, 'user-id');

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
    expect(mockCommentRepository.create).toHaveBeenCalledWith({
      model_id: '1',
      model_type: 'blog',
      content: 'Test comment',
    });
    expect(mockCommentRepository.save).toHaveBeenCalledWith(mockComment);

    expect(result).toEqual({
      message: 'Comment added successfully!',
      comment: mockComment,
      commentedBy: 'John Doe',
    });
  });

  it('should throw an InternalServerErrorException if saving the comment fails', async () => {
    const mockUser = { id: 'user-id', first_name: 'John', last_name: 'Doe' };

    mockUserRepository.findOne.mockResolvedValue(mockUser);
    mockCommentRepository.create.mockReturnValue({});
    mockCommentRepository.save.mockRejectedValue(new Error('Database error'));

    await expect(
      service.addComment({ model_id: '1', model_type: 'blog', content: 'Test comment' }, 'user-id')
    ).rejects.toThrow(InternalServerErrorException);
  });
});
