import { ApiProperty } from '@nestjs/swagger';

export class SendInvitationsResponseDto {
  @ApiProperty({ example: 'Invitation(s) sent successfully' })
  message: string;

  @ApiProperty({
    example: [
      {
        email: 'user1@example.com',
        inviteLink: 'https://frontend.example.com/invite?token=12345678-1234-1234-1234-123456789012',
      },
    ],
  })
  invitations: {
    email: string;
    inviteLink: string;
  }[];
}
