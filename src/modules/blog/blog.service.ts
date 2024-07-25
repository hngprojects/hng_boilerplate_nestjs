import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>
  ) {}

  async findLatest(limit: number = 5): Promise<Blog[]> {
    return this.blogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
