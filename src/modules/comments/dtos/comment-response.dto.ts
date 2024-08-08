import { Comment } from '../entities/comments.entity';

export class CommentResponseDto {
  message: string;
  savedComment: Comment;
  commentedBy: string;
}
