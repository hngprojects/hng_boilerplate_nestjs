import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../user/entities/user.entity';
import CustomExceptionHandler from '../../helpers/exceptionHandler';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User): Promise<any> {
    try {
      const fullUser = await this.userRepository.findOne({
        where: { id: user.id },
        select: ['first_name', 'last_name'],
      });

      if (!fullUser) {
        CustomExceptionHandler({
          response: 'User not found',
          status: 404,
        });
      }

      const comment = this.commentsRepository.create({
        ...createCommentDto,
        author: fullUser,
      });

      const savedComment = await this.commentsRepository.save(comment);
      const author = `${fullUser.first_name} ${fullUser.last_name}`;

      return {
        status: HttpStatus.CREATED,
        message: 'Comment created successfully',
        data: { comment },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating comment',
      };
    }
  }
}
