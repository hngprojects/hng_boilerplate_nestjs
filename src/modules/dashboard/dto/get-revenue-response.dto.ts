export class GetRevenueResponseDto {
  message: string;
  data: IResponseData;
}

interface IResponseData {
  totalRevenueCurrentMonth: number;
  totalRevenuePreviousMonth: number;
  revenuePercentChange: string;
}
