import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';
import { ProductDetailsDto } from './product-details.dto';

export class SearchResponseDto {
  @ApiProperty({
    description: 'The status of the request',
    example: 'true',
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'The status of the request',
    example: '200',
  })
  statusCode: number;

  @ApiProperty({
    description: 'The search results',
  })
  data: ProductDetailsDto[];
}
