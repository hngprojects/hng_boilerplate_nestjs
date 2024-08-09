import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { TestimonialData } from '../interfaces/testimonials.interface';

export class CreateTestimonialResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Status of the request',
    example: 'success',
  })
  'status': string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Message',
    example: 'Testimonial created successfully',
  })
  message: string;
  @IsNotEmpty()
  @ApiProperty({
    type: TestimonialData,
    description: 'Testimonial data',
    example: {
      id: '1',
      user_id: '1',
      name: 'John Doe',
      content: 'I am very happy with the service provided by the company',
      created_at: new Date(),
    },
  })
  data: TestimonialData;
}
