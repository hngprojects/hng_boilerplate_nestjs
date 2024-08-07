import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthPayloadDto {
  @ApiProperty({
    description: 'Access token provided by Google',
    example: 'ya29.a0AfH6SMBb4JG...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Expiration time in seconds for the access token',
    example: 3599,
  })
  expires_in: number;

  @ApiProperty({
    description: 'Refresh token provided by Google',
    example: '1//09gJ...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Scope of the access token',
    example: 'https://www.googleapis.com/auth/userinfo.profile',
  })
  scope: string;

  @ApiProperty({
    description: 'Type of the token provided',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'ID token provided by Google',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  id_token: string;

  @ApiProperty({
    description: 'Expiration time in epoch format',
    example: 1629716100,
  })
  expires_at: number;

  @ApiProperty({
    description: 'Provider of the authentication service',
    example: 'google',
  })
  provider: string;

  @ApiProperty({
    description: 'Type of the authentication',
    example: 'oauth',
  })
  type: string;

  @ApiProperty({
    description: 'Provider account ID',
    example: '1234567890',
  })
  providerAccountId: string;
}
