import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { skipAuth } from '../../helpers/skipAuth';
import UserService from '../user/user.service';
import { CreateTestimonialResponseDto } from './dto/create-testimonial-response.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,

    private userService: UserService
  ) {}

  @Post()
  @skipAuth()
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

    const userId = 'a9fb405b-ce70-4314-8177-25b056a0cb53';

    const user = await this.userService.getUserRecord({ identifier: userId, identifierType: 'id' });

    const data = await this.testimonialsService.createTestimonial(createTestimonialDto, user);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data,
    };
  }
}
