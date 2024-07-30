import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../user/entities/user.entity';
import { CommentResponseDto } from './dto/comment-response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

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
      };
    } catch (error) {
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

    try {
      await this.commentRepository.update(commentId, updateCommentDto);
      const updatedComment = await this.commentRepository.findOneBy({ id: commentId });

      return {
        message: 'Comment updated successfully!',
        comment: updatedComment,
      };
    } catch (error) {
      throw new InternalServerErrorException('An internal server error occurred');
    }
  }
}
