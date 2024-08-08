import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TestimonialResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Status message',
    example: 'Testimonial fetched successfully',
  })
  message: string;

  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: 'HTTP status code',
    example: 200,
  })
  status_code: number;

  @IsNotEmpty()
  @ApiProperty({
    type: 'object',
    description: 'Testimonial data',
    example: {
      id: '1',
      author: 'John Doe',
      testimonial: 'I am very happy with the service provided by the company',
      comments: [],
      created_at: new Date(),
    },
  })
  data: {
    id: string;
    author: string;
    testimonial: string;
    comments: any[]; // Replace with appropriate type if comments are implemented
    created_at: Date;
  };
}
