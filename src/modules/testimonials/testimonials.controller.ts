import { Body, Controller, Post, Req, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CustomExceptionFilter } from '../../helpers/custom-exception.filter';
import UserService from '../user/user.service';
import { CreateTestimonialResponseDto } from './dto/create-testimonial-response.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@ApiTags('Testimonials')
@UseFilters(CustomExceptionFilter)
@Controller('testimonials')
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,

    private userService: UserService
  ) {}

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
    const { sub: userId } = req?.user as { sub: string };

    const user = await this.userService.getUserRecord({ identifier: userId, identifierType: 'id' });

    const data = await this.testimonialsService.createTestimonial(createTestimonialDto, user);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data,
    };
  }
}
