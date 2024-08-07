import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ProductDetailsDto } from './product-details.dto';

export class SuccessfulCreateResponseDto {
  @ApiProperty({
    description: 'The status of the request',
    example: '200',
  })
  status: number;

  @ApiProperty({
    description: 'The message of the response',
    example: 'Product created successfully',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The created product details',
  })
  data: ProductDetailsDto;
}
