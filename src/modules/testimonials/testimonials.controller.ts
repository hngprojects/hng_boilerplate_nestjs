import { Body, Controller, Post, Req, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CustomExceptionFilter } from 'src/helpers/custom-exception.filter';
import { CreateTestimonialDto, CreateTestimonialResponseDto } from './dto/create-testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@ApiTags('Testimonials')
@UseFilters(CustomExceptionFilter)
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Testimonials' })
  @ApiResponse({ status: 201, description: 'Testimonial created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @Req() req: Request
  ): Promise<CreateTestimonialResponseDto> {
    // const { sub: userId } = req?.user as { sub: string };

    const userId = 'a9fb405b-cd70-4314-8177-25b056a0cb53';

    const data = await this.testimonialsService.create(createTestimonialDto, userId);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data,
    };
  }
}
