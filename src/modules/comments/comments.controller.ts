import { UserPayload } from './../user/interfaces/user-payload.interface';
import { User } from './../user/entities/user.entity';
import { Controller, Body, Post, Request, Get, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentResponseDto } from './dtos/comment-response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post('add')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'The comment has been successfully created.', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async addComment(@Body() createCommentDto: CreateCommentDto, @Request() req): Promise<CommentResponseDto> {
    const userId = req.user.id;
    return await this.commentsService.addComment(createCommentDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been retrieved successfully.' })
  async getAComment(@Param('id') id: string): Promise<any> {
    return await this.commentsService.getAComment(id);
  }

  @Get(':id/thread')
  @ApiOperation({ summary: 'Get a comment thread' })
  @ApiResponse({ status: 200, description: 'The comment thread has been retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  async getCommentThread(@Param('id') id: string): Promise<any> {
    return await this.commentsService.getCommentThread(id);
  }

  @Post @ApiOperation({ summary: 'Dislike a comment' })
  @ApiResponse({ status: 200, description: 'Dislike updated successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @Post(':id/dislike')
  async dislikeComment(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return await this.commentsService.dislikeComment(id, userId);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been deleted successfully.' })
  @Delete(':id/delete')
  async deleteAComment(@Param('id') id: string, @Request() req): Promise<any> {
    return await this.commentsService.deleteAComment(id, req.user.id);
  }
}