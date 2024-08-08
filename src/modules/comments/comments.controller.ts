import { Controller, Body, Post, Request, Param, Patch, Get } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: 201, description: 'The comment has been created successfully.' })
  @Post('add')
  async addComment(@Body() createCommentDto: CreateCommentDto, @Request() req): Promise<CommentResponseDto> {
    const { userId } = req.user;
    return await this.commentsService.addComment(createCommentDto, userId);
  }

  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been successfully updated.' })
  @Patch('update/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ): Promise<CommentResponseDto> {
    const { userId } = req.user;
    return await this.commentsService.updateComment(id, userId, updateCommentDto);
  }

  @ApiOperation({ summary: 'Get a comment' })
  @ApiResponse({ status: 200, description: 'The comment has been retrieved successfully.' })
  @Get(':id')
  async getAComment(@Param('id') id: string, @Request() req): Promise<any> {
    const { userId } = req.user;
    return await this.commentsService.getAComment(id, userId);
  }
}
