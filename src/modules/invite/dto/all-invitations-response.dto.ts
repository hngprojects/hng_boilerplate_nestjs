import { InviteDto } from './invite.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedInvitationsDto {
  @ApiProperty({ type: [InviteDto] })
  invitations: InviteDto[];

  @ApiProperty({ example: 250, description: 'Total number of invitations' })
  total: number;
}

export class FindAllInvitationsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'Invitations retrieved successfully' })
  message: string;

  @ApiProperty({ type: PaginatedInvitationsDto })
  data: PaginatedInvitationsDto;
}
