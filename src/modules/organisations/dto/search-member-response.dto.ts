import { ApiProperty } from '@nestjs/swagger';

class OrganisationMembersResponseFormat {
  @ApiProperty({ example: '12345-2356-3234' })
  user_id: string;

  @ApiProperty({ example: 'johndoe138' })
  username: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '2345678' })
  phone_number: string;

  @ApiProperty({ example: 'https://domain.com/url-path' })
  profile_pic_url: string;
}

class Data {
  @ApiProperty()
  members: OrganisationMembersResponseFormat[];
}

export class SearchMemberResponseDto {
  @ApiProperty({ type: Data })
  data: Data;
}
