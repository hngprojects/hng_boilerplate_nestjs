import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comments.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentResponseDto } from './dtos/comment-response.dto';
import { User } from '@modules/user/entities/user.entity';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addComment(createCommentDto: CreateCommentDto, userId: string): Promise<CommentResponseDto> {
    const { model_id, model_type, comment, parentId } = createCommentDto;

    if (!comment || comment.trim().length === 0) {
      throw new CustomHttpException('Comment cannot be empty', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let parentComment: Comment | undefined;
    if (parentId) {
      parentComment = await this.commentRepository.findOne({ where: { id: parentId } });
      if (!parentComment) {
        throw new CustomHttpException('Parent comment not found', HttpStatus.NOT_FOUND);
      }
    }

    const newComment = this.commentRepository.create({
      model_id,
      model_type,
      comment,
      parent: parentComment, // Requires `parent_id` column in PostgreSQL
    });
    newComment.user = user;

    const savedComment = await this.commentRepository.save(newComment); // Will fail without DB update
    const commentedBy = `${user.first_name} ${user.last_name}`;

    return {
      message: 'Comment added successfully!',
      savedComment,
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


  async getCommentThread(commentId: string): Promise<{ message: string; data: Comment }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'replies', 'replies.user'], // Requires `parent_id` column in PostgreSQL
    });
    if (!comment) {
      throw new CustomHttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Comment thread retrieved successfully',
      data: comment,
    };
  }

  async deleteAComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({ where: { id: commentId }, relations: ['user'] });
    if (!comment) {
      throw new CustomHttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = comment.user.id === userId;

    if (!isOwner) {
      throw new CustomHttpException('You are not authorized to delete this comment', HttpStatus.FORBIDDEN);
    }

    await this.commentRepository.delete(comment.id);

    return {
      message: 'Comment deleted successfully!',
      status: HttpStatus.OK,
      data: { comment },
    };
  }

  async dislikeComment(commentId: string, userId: string): Promise<{ message: string; dislikeCount: number }> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id = :id', { id: commentId })
      .getOne();

    if (!comment) {
      throw new CustomHttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (!comment.dislikedBy) {
      comment.dislikedBy = [];
    }

    // Check if the user has already disliked the comment
    if (comment.dislikedBy.includes(userId)) {
      throw new CustomHttpException('You have already disliked this comment', HttpStatus.BAD_REQUEST);
    }

    // Add the user to the dislikedBy array and increment dislikes
    comment.dislikedBy.push(userId);
    comment.dislikes = comment.dislikedBy.length;

    await this.commentRepository.save(comment);

    return {
      message: 'Dislike updated successfully',
      dislikeCount: comment.dislikes,
    };
  }