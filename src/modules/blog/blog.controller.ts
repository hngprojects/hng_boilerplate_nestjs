import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { BlogService } from './blog.service';
import { skipAuth } from '../../helpers/skipAuth';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * Retrieves the latest blog posts.
   * @param limit - Optional query parameter to specify the number of latest blog posts to return. Defaults to 5 if not provided.
   * @returns An array of Blog entities.
   * @throws {HttpException} - If an error occurs while fetching blog posts.
   */
  @skipAuth()
  @Get('latest')
  async findLatest(@Query('limit') limit?: number) {
    try {
      const result = await this.blogService.findLatest(limit ? +limit : undefined);
      return result;
    } catch (error) {
      // Log the error for debugging (consider using a logger here)
      throw new HttpException('Unable to fetch latest blog posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
