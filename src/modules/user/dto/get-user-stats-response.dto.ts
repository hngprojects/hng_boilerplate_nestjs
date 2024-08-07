import { ApiProperty } from '@nestjs/swagger';

export class GetUserStatsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'User statistics retrieved successfully' })
  message: string;

  @ApiProperty({
    example: {
      total_users: 100,
      active_users: 80,
      deleted_users: 20,
    },
  })
  data: {
    total_users: number;
    active_users: number;
    deleted_users: number;
  };
}
