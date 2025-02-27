import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllSubscriptionsResponseDto } from './dto/get-all-subscription-response.dto';
import { NewsletterSubscription } from '@modules/newsletter-subscription/entities/newsletter-subscription.entity';
import { NewsletterSubscriptionService } from '@modules/newsletter-subscription/newsletter-subscription.service';

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
