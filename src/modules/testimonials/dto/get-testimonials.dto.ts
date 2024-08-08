import { TestimonialData } from '../interfaces/testimonials.interface';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class TestimonialDataDto {
  @ApiProperty({
    description: "The user's id",
    example: '1',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: "The list of the user's testimonials",
    example: {
      id: 'testimonial-id',
      name: 'Client Name',
      content: 'Testimonial Content',
      created_at: new Date(),
    },
  })
  testimonials: TestimonialData[];
}

export class GetTestimonialsResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'User testimonials retrieved successfully',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The data',
  })
  data: TestimonialDataDto;
}

export class GetTestimonials400ErrorResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'User has no testimonials',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Response status code',
    example: '400',
  })
  status: number;
}

export class GetTestimonials404ErrorResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'User not found!',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Response status code',
    example: '404',
  })
  status: number;
}
