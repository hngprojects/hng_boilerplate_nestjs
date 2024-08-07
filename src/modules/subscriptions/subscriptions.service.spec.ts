import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from '../newsletter-subscription/entities/newsletter-subscription.entity';
import { NewsletterSubscriptionService } from '../newsletter-subscription/newsletter-subscription.service';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let repository: Repository<NewsletterSubscription>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        NewsletterSubscriptionService,
        {
          provide: getRepositoryToken(NewsletterSubscription),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    repository = module.get<Repository<NewsletterSubscription>>(getRepositoryToken(NewsletterSubscription));
  });

  it('should return subscription count', async () => {
    const subscriptionCount = 5;
    const findAndCountMock = jest.spyOn(repository, 'findAndCount').mockResolvedValue([[], subscriptionCount]);

    const result = await service.getAllSubscriptions();

    expect(findAndCountMock).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
    expect(result).toEqual({
      message: 'Subscription count fetched successfully',
      data: {
        subscription_count: subscriptionCount,
      },
    });
  });
});
