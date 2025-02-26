import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserService from '../user/user.service';
import { Testimonial } from './entities/testimonials.entity';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { TextService } from '@modules/translation/translation.service';
import { User } from '@modules/user/entities/user.entity';
import { Profile } from '@modules/profile/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial, User, Profile])],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, Repository, UserService, TextService],
})
export class TestimonialsModule {}
