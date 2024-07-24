import { Controller, Body, Patch, Param, } from '@nestjs/common';
// eslint-disable-next-line import/namespace
import { BlogsService } from './blogs.service';
import { UpdateCommentDto } from './dto/update-blog.dto';

@Controller('/api/v1/')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Patch('comment/edit/:comment_id')
  update(@Param('comment_id') commentId: string, @Body() updateBlogDto: UpdateCommentDto) {
    return this.blogsService.update(+commentId, updateBlogDto);
  }
}
