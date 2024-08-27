import { Controller, Body, Post, Request, Get, Param, Patch } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentResponseDto } from './dtos/comment-response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateCommentDto } from './dtos/update-comment.dto';

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

  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'User or Comment not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @Patch('update/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ): Promise<CommentResponseDto> {
    const { userId } = req.user;
    return await this.commentsService.updateComment(id, userId, updateCommentDto);

  @ApiOperation({ summary: 'Get a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been retrieved successfully.' })
  @Get(':id')
  async getAComment(@Param('id') id: string): Promise<any> {
    return await this.commentsService.getAComment(id);
  }
}
