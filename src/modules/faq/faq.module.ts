import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { Faq } from './entities/faq.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Faq, User])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
