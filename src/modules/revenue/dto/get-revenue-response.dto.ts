export class GetRevenueResponseDto {
  message: string;
  data: IResponseData;
}

interface IResponseData {
  totalRevenueCurrentMonth: number;
  revenuePercentChange: string;
}
