import { ApiProperty } from '@nestjs/swagger';
import { Blog } from '../entities/blog.entity';
import { UserType } from '../../../modules/user/entities/user.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';

export class ResponseDto {
  @ApiProperty({ example: 'success', description: 'The status of the response' })
  status: string;

  @ApiProperty({ example: 'Blog created successfully', description: 'The message of the response' })
  message: string;

  @ApiProperty({ example: 201, description: 'The HTTP status code of the response' })
  status_code: number;

  @ApiProperty({ type: Blog, description: 'The data of the response', required: false })
  data?: {
    id: string;
    title: string;
    image_url: string;
    content: string;
    author: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      user_type: UserType;
      is_active: boolean;
      attempts_left: number;
      time_left: number;
      owned_organisations: Organisation[];
      created_organisations: Organisation[];
      created_at: Date;
      updated_at: Date;
    };
    comments: { id: string; content: string }[];
    isPublished: boolean;
    category: { id: string; name: string };
  };
}
