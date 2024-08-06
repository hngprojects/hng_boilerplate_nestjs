import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: 201, description: 'Comment create successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createCommentDto: CreateCommentDto, @Request() req): Promise<any> {
    return this.commentsService.create(createCommentDto, req.user);
  }
}
