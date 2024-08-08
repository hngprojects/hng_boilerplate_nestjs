import { Body, Controller, Post, Req, Param, Get, ParseUUIDPipe, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import UserService from '../user/user.service';
import { CreateTestimonialResponseDto } from './dto/create-testimonial-response.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { TestimonialsService } from './testimonials.service';
import { TestimonialResponseDto } from './dto/response-testimonial.dto';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { TestimonialResponse } from './interfaces/testimonial-response.interface';
import { TestimonialData } from './interfaces/testimonials.interface';

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
    @Req() req: { user: UserPayload }
  ): Promise<CreateTestimonialResponseDto> {
    const userId = req?.user.id;

    const user = await this.userService.getUserRecord({ identifier: userId, identifierType: 'id' });

    const testimonial = await this.testimonialsService.createTestimonial(createTestimonialDto, user);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data: {
        id: testimonial.id,
        user_id: testimonial.user.id,
        name: testimonial.name,
        content: testimonial.content,
        created_at: testimonial.created_at,
      },
    };
  }
  @Get(':testimonial_id')
  @ApiOperation({ summary: 'Fetch a single testimonial by Id' })
  @ApiResponse({ status: 200, description: 'Testimonial fetched successfully' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTestimonial(
    @Param('testimonial_id', ParseUUIDPipe) testimonialId: string,
    @Req() req: { user: UserPayload }
  ): Promise<TestimonialResponseDto> {
    const testimonial = await this.testimonialsService.getTestimonialById(testimonialId);
    const responseData: TestimonialResponse = {
      id: testimonial.id,
      author: testimonial.name,
      testimonial: testimonial.content,
      comments: [],
      created_at: testimonial.created_at,
    };

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.TESTIMONIAL_FOUND,
      data: responseData,
    };
  }
}
