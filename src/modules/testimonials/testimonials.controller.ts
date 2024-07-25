import { Body, Controller, HttpStatus, NotFoundException, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import UserService from '../user/user.service';
import { CreateTestimonialResponseDto } from './dto/create-testimonial-response.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@ApiBearerAuth()
@ApiTags('Testimonials')
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

    if (!user) {
      throw new NotFoundException({
        status: 'error',
        error: 'Not Found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }

    const data = await this.testimonialsService.createTestimonial(createTestimonialDto, user);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data,
    };
  }
}
