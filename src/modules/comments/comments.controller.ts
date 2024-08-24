import { Controller, Body, Post, Request, Get, Param } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'The comment has been successfully created.', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async addComment(@Body() createCommentDto: CreateCommentDto, @Request() req): Promise<CommentResponseDto> {
    const { userId } = req.user;
    return await this.commentsService.addComment(createCommentDto, userId);
  }

  @ApiOperation({ summary: 'Get a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been retrieved successfully.' })
  @Get(':id')
  async getAComment(@Param('id') id: string, @Request() req): Promise<any> {
    const { userId } = req.user;
    return await this.commentsService.getAComment(id, userId);
  }
}
