import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from '../user/entities/user.entity';
import { CommentResponseDto } from './dtos/comment-response.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async addComment(createCommentDto: CreateCommentDto, userId: string): Promise<CommentResponseDto> {
    const { model_id, model_type, comment } = createCommentDto;

    if (!comment || comment.trim().length === 0) {
      throw new CustomHttpException('Comment cannot be empty', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const commentedBy: string = user.first_name + ' ' + user.last_name;

    const Comment = this.commentRepository.create({
      model_id,
      model_type,
      comment,
    });

    const loadComment = await this.commentRepository.save(Comment);
    return {
      message: 'Comment added successfully!',
      savedComment: loadComment,
      commentedBy,
    };
  }

  async getAComment(commentId: string) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new CustomHttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Comment retrieved successfully',
      data: { comment },
    };
  }
}
