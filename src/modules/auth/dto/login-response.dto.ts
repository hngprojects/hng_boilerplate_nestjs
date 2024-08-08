import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;
}

export class DataDto {
  @ApiProperty({
    description: 'User details',
    type: UserDto,
  })
  user: UserDto;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Status message of the login response',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'Data object containing user information and other relevant data',
    type: DataDto,
  })
  data: DataDto;

  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;
}
