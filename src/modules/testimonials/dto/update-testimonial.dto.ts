import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTestimonialDto {
  @ApiPropertyOptional({ description: 'Updated content of the testimonial' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Updated name associated with the testimonial' })
  @IsString()
  @IsOptional()
  name?: string;
}
