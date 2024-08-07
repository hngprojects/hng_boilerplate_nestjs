export class GetAllSubscriptionsResponseDto {
  message: string;
  data: SubscriptionCount;
}

interface SubscriptionCount {
  subscription_count: number;
}
