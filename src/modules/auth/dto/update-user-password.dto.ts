import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  phone_number: string;
}

export class UpdateUserPasswordResponseDTO {
  @ApiProperty({
    description: 'Status of the password update operation',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Message providing additional information about the password update',
    example: 'Password updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Details of the updated user',
    type: UserDto,
  })
  user: UserDto;
}
