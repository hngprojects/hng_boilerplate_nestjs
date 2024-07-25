import { Controller, Get } from '@nestjs/common';
import { BlogService } from './blog.service';
import { skipAuth } from '../../helpers/skipAuth';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @skipAuth()
  @Get('latest')
  findLatest() {
    return this.blogService.findLatest();
  }
}
