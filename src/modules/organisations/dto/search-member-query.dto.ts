import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

enum Filter {
  suspended = 'suspended',
  active_member = 'active_member',
  left_workspace = 'left_workspace',
}

export class SearchMemberQueryDto {
  @ApiProperty({ enum: Filter, isArray: false, required: false })
  filter?: 'suspended' | 'active_member' | 'left_workspace';
}
