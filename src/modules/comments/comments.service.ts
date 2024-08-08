import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from '../user/entities/user.entity';
import { CommentResponseDto } from './dtos/comment-response.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
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
      throw new BadRequestException('Comment cannot be empty');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const commentedBy: string = user.first_name + ' ' + user.last_name;

    try {
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An internal server error occurred');
    }
  }

  async updateComment(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
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
