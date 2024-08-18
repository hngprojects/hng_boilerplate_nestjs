import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';
import { Testimonial } from './entities/testimonials.entity';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { Profile } from '../profile/entities/profile.entity';
import { TextService } from '../translation/translation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial, User, Profile])],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, Repository, UserService, TextService],
})
export class TestimonialsModule {}
