import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from '../newsletter-subscription/entities/newsletter-subscription.entity';
import { NewsletterSubscriptionService } from '../newsletter-subscription/newsletter-subscription.service';
import { GetAllSubscriptionsResponseDto } from './dto/get-all-subscription-response.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly newsletterSubscriptionService: NewsletterSubscriptionService,

    @InjectRepository(NewsletterSubscription)
    private readonly newsletterSubscriptionRepository: Repository<NewsletterSubscription>
  ) {}

  async getAllSubscriptions(): Promise<GetAllSubscriptionsResponseDto> {
    const [, subscription_count] = await this.newsletterSubscriptionRepository.findAndCount({
      where: { deletedAt: null },
    });

    return {
      message: 'Subscription count fetched successfully',
      data: {
        subscription_count,
      },
    };
  }
}
