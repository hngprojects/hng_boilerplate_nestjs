import { ApiProperty } from '@nestjs/swagger';

export class AlreadySubscribedResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'User is already subscribed.' })
  message: string;

  @ApiProperty({ example: 'error' })
  error: string;
}
