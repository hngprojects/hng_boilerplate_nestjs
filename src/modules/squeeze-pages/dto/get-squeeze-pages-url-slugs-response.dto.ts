import { ApiProperty } from '@nestjs/swagger';

export class GetSqueezePagesUrlSlugsResponseDto {
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
    example: 'Squeeze pages URL slugs fetched successfully',
    description: 'The message of the response',
    nullable: false,
  })
  message: string;

  @ApiProperty({
    example: {
      squeeze_pages_slug_uri: ['product', 'service'],
    },
    description: 'The data of the response',
    nullable: true,
  })
  data: SqueezePagesUrlSlugsResponseDto;
}

type SqueezePagesUrlSlugsResponseDto = {
  squeeze_pages_slug_uri: string[];
};
