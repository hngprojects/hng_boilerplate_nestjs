import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './blogs.controller';
import { BlogService } from './blogs.service';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
