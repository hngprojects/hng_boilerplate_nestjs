import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly user_id: string;
}
