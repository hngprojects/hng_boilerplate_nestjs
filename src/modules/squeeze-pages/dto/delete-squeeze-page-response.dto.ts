import { ApiProperty } from '@nestjs/swagger';

export class DeleteSqueezePageResponseDto {
  @ApiProperty({
    example: 'success',
    description: 'The status of the response',
    nullable: false,
  })
  status: string;

  @ApiProperty({
    example: 200,
    description: 'The status code of the response',
    nullable: false,
  })
  status_code: number;

  @ApiProperty({
    example: 'Squeeze page deleted successfully',
    description: 'The message of the response',
    nullable: false,
  })
  message: string;
}
