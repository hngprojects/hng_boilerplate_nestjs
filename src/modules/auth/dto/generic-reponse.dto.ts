import { ApiProperty } from '@nestjs/swagger';

export class GenericAuthResponseDto {
  @ApiProperty({
    description: 'Status message indicating the result of the operation',
    example: 'Verification token sent to mail',
  })
  message: string;
}
