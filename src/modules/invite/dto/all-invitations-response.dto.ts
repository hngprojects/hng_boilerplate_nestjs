import { InviteDto } from './invite.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllInvitationsResponseDto {
  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'Successfully fetched invites' })
  message: string;

  @ApiProperty({ type: [InviteDto] })
  data: InviteDto[];
}
