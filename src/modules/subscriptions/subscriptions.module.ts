import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { NewsletterSubscriptionService } from '@modules/newsletter-subscription/newsletter-subscription.service';
import { User } from '@modules/user/entities/user.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { NewsletterSubscription } from '@modules/newsletter-subscription/entities/newsletter-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscription, Organisation, User])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, NewsletterSubscriptionService],
})
export class SubscriptionsModule {}
