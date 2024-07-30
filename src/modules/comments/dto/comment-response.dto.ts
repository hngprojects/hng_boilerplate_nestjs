import { Comment } from '../entities/comment.entity';

export class CommentResponseDto {
  message: string;
  comment: Comment;
}
