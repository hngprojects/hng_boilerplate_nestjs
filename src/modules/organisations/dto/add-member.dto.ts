import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    type: String,
  })
  @IsUUID()
  readonly user_id: string;
}
