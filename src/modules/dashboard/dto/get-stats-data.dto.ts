export class GetStatsDataDto {
  revenue: IStatsData;
  Subscriptions: IStatsData;
  orders: IStatsData;
  active_users: IActiveUsersData;
}

class IStatsData {
  current_month: number;
  previous_month: number;
  percentage_difference: string;
}

class IActiveUsersData {
  current: number;
  difference_an_hour_ago: number;
}
