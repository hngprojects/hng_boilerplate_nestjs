import { Module } from '@nestjs/common';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { NewsletterSubscriptionController } from './newsletter-subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscription, User])],
  controllers: [NewsletterSubscriptionController],
  providers: [NewsletterSubscriptionService],
})
export class NewsletterSubscriptionModule {}
