import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto';
import { NewsletterSubscriptionResponseDto } from './dto/newsletter-subscription.response.dto';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';

@Injectable()
export class NewsletterSubscriptionService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly newsletterSubscriptionRepository: Repository<NewsletterSubscription>
  ) {}

  async newsletterSubscription(createNewsletterSubscriptionDto: CreateNewsletterSubscriptionDto) {
    const { email } = createNewsletterSubscriptionDto;

    const existingSubscription = await this.newsletterSubscriptionRepository.findOne({ where: { email: email } });
    if (existingSubscription) {
      return { message: 'Subscriber subscription successful' };
    }
    const newSubscription = this.newsletterSubscriptionRepository.create({ ...createNewsletterSubscriptionDto });
    await this.newsletterSubscriptionRepository.save(newSubscription);
    const response = { status: 'success', message: 'Subscriber subscription successful' };
    return response;
  }

  async findAllSubscribers(
    page: number = 1,
    limit: number = 10
  ): Promise<{ subscribers: NewsletterSubscriptionResponseDto[]; total: number }> {
    const [subscribers, total] = await this.newsletterSubscriptionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      subscribers: subscribers.map(this.mapSubscriberToResponseDto),
      total,
    };
  }

  async removeSubscriber(id: string) {
    const subscription = await this.newsletterSubscriptionRepository.findOne({ where: { id } });
    if (!subscription) {
      throw new NotFoundException(`Subscriber with ID ${id} not found`);
    }
    await this.newsletterSubscriptionRepository.softDelete(id);
    return { message: `Subscriber with ID ${id} has been soft deleted` };
  }

  async findSoftDeleted() {
    return await this.newsletterSubscriptionRepository.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
    });
  }

  async restore(id: string) {
    const result = await this.newsletterSubscriptionRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Subscriber with ID ${id} not found or already restored`);
    }
    return { message: `Subscriber with ID ${id} has been restored` };
  }

  private mapSubscriberToResponseDto(
    newsletterSubscription: NewsletterSubscription
  ): NewsletterSubscriptionResponseDto {
    return {
      id: newsletterSubscription.id,
      email: newsletterSubscription.email,
    };
  }
}
