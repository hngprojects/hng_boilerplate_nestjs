import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from '../newsletter-subscription/entities/newsletter-subscription.entity';
import { NewsletterSubscriptionService } from '../newsletter-subscription/newsletter-subscription.service';
import { Organisation } from '../organisations/entities/organisations.entity';
import { User } from '../user/entities/user.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscription, Organisation, User])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, NewsletterSubscriptionService],
})
export class SubscriptionsModule {}
