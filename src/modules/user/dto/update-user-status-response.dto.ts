import { ApiProperty } from '@nestjs/swagger';
import { number, object } from 'joi';
import { User } from '../entities/user.entity';

export class UpdateUserStatusResponseDto {
  @ApiProperty({ type: String, example: 'success' })
  status: string;

  @ApiProperty({ type: number, example: 200 })
  status_code: number;

  @ApiProperty({
    type: object,
    example: {
      id: '4a3731d6-8dfd-42b1-b572-96c7805f7586',
      created_at: '2024-08-05T19:16:57.264Z',
      updated_at: '2024-08-05T19:43:25.073Z',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
      status: 'Hello there! This is what my updated status looks like!',
    },
  })
  data: object;
}
