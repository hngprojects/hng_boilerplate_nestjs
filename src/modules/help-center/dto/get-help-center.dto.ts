import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetHelpCenterDto {
  @ApiProperty({
    description: 'The unique identifier of the help center topic',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID('4', { message: 'Invalid UUID format for id' })
  id: string;
}
