import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from '../user/entities/user.entity';
import { CommentResponseDto } from './dtos/comment-response.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async updateComment(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new CustomHttpException('Comment not found', 404);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomHttpException('User not found', 404);
    }

    await this.commentRepository.update(commentId, updateCommentDto);
    const updatedComment = await this.commentRepository.findOneBy({ id: commentId });

    return {
      message: 'Comment updated successfully!',
      savedComment: updatedComment,
      commentedBy: user.first_name + ' ' + user.last_name,
    };
  }
}
