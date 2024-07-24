import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Name of the user',
    example: 'John Doe',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Content of the testimonial',
    example: 'I am very happy with the service provided by the company',
  })
  content: string;
}
