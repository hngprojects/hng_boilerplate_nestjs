import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from '../user/entities/user.entity';
import { CommentResponseDto } from './dtos/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async addComment(createCommentDto: CreateCommentDto, userId: string): Promise<CommentResponseDto> {
    const { model_id, model_type, content } = createCommentDto;

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Comment cannot be empty');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const commentedBy: string = user.first_name + ' ' + user.last_name;

    try {
      const comment = this.commentRepository.create({
        model_id,
        model_type,
        content,
      });

      const savedComment = await this.commentRepository.save(comment);
      return {
        message: 'Comment added successfully!',
        comment: savedComment,
        commentedBy,
      };
    } catch (error) {
      throw new InternalServerErrorException('An internal server error occurred');
    }
  }
}
