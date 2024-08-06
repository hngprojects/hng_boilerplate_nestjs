import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

enum Filter {
  suspended = 'suspended',
  active_member = 'active_member',
  left_workspace = 'left_workspace',
}

export class SearchMemberQueryDto {
  @ApiProperty({ enum: Filter, isArray: false, example: 'active_member' })
  @IsString()
  filter?: 'suspended' | 'active_member' | 'left_workspace';
}

type OrganisationMembersResponseFormat = {
  user_id: string;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  profile_pic_url: string;
};

export class SearchMemberResponseDto {
  data: {
    members: OrganisationMembersResponseFormat[];
  };
}

export class SearchMemberBodyDto {
  @ApiProperty({ type: String })
  @IsString()
  search_term: string;
}
