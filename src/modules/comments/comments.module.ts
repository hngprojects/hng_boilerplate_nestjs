import { Module } from '@nestjs/common';
import { Comment } from './entities/comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
})
export class CommentModule {}
