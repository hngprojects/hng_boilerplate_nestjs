import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteProductDto {
  @ApiProperty({
    description: 'The response message',
    example: 'Product successfully deleted',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The response data',
  })
  @IsString()
  data: {};
}
