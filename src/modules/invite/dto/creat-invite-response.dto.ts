import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteResponseDto {
  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'Invite link generated successfully' })
  message: string;

  @ApiProperty({ example: 'https://frontend.example.com/invite?token=12345678-1234-1234-1234-123456789012' })
  link: string;
}
