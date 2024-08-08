import { ApiProperty } from '@nestjs/swagger';

class TotalProductsData {
  @ApiProperty({ example: 20 })
  total_products: number;

  @ApiProperty({ example: '+100.00% from last month' })
  percentage_change: string;
}

export class GetTotalProductsResponseDto {
  @ApiProperty()
  status: string;
  @ApiProperty()
  status_code: number;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: TotalProductsData })
  data: TotalProductsData;
}
