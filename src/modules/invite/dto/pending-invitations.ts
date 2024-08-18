import { InviteDto } from './invite.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllPendingInvitationsResponseDto {
  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'Successfully fetched pending invites' })
  message: string;

  @ApiProperty({ type: [InviteDto] })
  data: InviteDto[];
}
