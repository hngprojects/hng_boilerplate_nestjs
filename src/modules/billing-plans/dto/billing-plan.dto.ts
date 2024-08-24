import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class BillingPlanDto {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty({ example: 'Free' })
  name: string;

  @ApiProperty({ example: 0 })
  price: number;
}
