import { Module } from '@nestjs/common';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faqs } from './entities/faqs.entity';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faqs, User])],
  controllers: [FaqsController],
  providers: [FaqsService, UserService],
})
export class FaqsModule {}
