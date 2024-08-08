import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

class StockDto {
  @ApiProperty({
    description: 'Product id',
    example: 'product_1',
  })
  @IsString()
  product_id: string;

  @ApiProperty({
    description: 'Product stock',
    example: '15',
  })
  current_stock: number;

  @ApiProperty({
    description: 'Date when the stock was last updated',
    example: new Date(),
  })
  last_updated: Date;
}

export class StockResponseDto {
  @ApiProperty({
    description: 'The response message',
    example: 'Product stock retrieved successfully',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The response data',
  })
  data: StockDto;
}
