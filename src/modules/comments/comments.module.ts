import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comments.entity';
import { UserModule } from '@modules/user/user.module';
import { User } from '@modules/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User]), UserModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
