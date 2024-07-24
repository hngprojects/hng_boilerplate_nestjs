import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  imports: [TypeOrmModule.forFeature([Blog])],
})
export class BlogModule {}
