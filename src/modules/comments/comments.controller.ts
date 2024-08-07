import { Controller, Body, Post, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentResponseDto } from './dtos/comment-response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Post('add')
  async addComment(@Body() createCommentDto: CreateCommentDto, @Request() req): Promise<CommentResponseDto> {
    const { userId } = req.user;
    return await this.commentsService.addComment(createCommentDto, userId);
  }
}
