import { ApiProperty } from '@nestjs/swagger';
import { SqueezePage } from '../entities/squeeze-pages.entity';

export class UpdateSqueezePageResponseDto {
  @ApiProperty({
    example: 'success',
    description: 'The status of the response',
    nullable: false,
  })
  status: string;

  @ApiProperty({
    example: 200,
    description: 'The status code of the response',
    nullable: false,
  })
  status_code: number;

  @ApiProperty({
    example: 'Squeeze page updated successfully',
    description: 'The message of the response',
    nullable: false,
  })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      title: 'My Squeeze Page',
      uri_slug: 'my-squeeze-page',
      user_id: 1,
      created_at: '2021-10-01T00:00:00.000Z',
      updated_at: '2021-10-01T00:00:00.000Z',
    },
    description: 'The data of the response',
    nullable: false,
  })
  data: UpdateSqueezePageResponseData;
}

type UpdateSqueezePageResponseData = {
  squeeze_page: SqueezePage;
};
