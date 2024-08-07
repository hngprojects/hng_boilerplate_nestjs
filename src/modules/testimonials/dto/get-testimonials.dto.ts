import { TestimonialData } from '../interfaces/testimonials.interface';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class DataDto {
  @ApiProperty({
    description: "The user's id",
    example: '1',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: "The list of the user's testimonials",
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
  data: DataDto;
}

export class GetTestimonialsErrorResponseDto {
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
