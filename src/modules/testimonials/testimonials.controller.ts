import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Param,
  DefaultValuePipe,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import UserService from '../user/user.service';
import { CreateTestimonialResponseDto } from './dto/create-testimonial-response.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { TestimonialsService } from './testimonials.service';
import {
  GetTestimonialsResponseDto,
  GetTestimonials400ErrorResponseDto,
  GetTestimonials404ErrorResponseDto,
} from './dto/get-testimonials.dto';

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

    const data = await this.testimonialsService.createTestimonial(createTestimonialDto, user);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data,
    };
  }

  @ApiOperation({ summary: "Get All User's Testimonials" })
  @ApiResponse({
    status: 200,
    description: 'User testimonials retrieved successfully',
    type: GetTestimonialsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: GetTestimonials404ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User has no testimonials',
    type: GetTestimonials400ErrorResponseDto,
  })
  @Get('user/:user_id')
  async getAllTestimonials(
    @Param('user_id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('page_size', new DefaultValuePipe(3), ParseIntPipe) page_size: number
  ) {
    return this.testimonialsService.getAllTestimonials(userId, page, page_size);
  }
  @Get(':testimonial_id')
  @ApiOperation({ summary: 'Get Testimonial By ID' })
  @ApiResponse({
    status: 200,
    description: 'Testimonial fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Testimonial not found',
    type: GetTestimonials404ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTestimonialById(@Param('testimonial_id', ParseUUIDPipe) testimonialId: string) {
    return this.testimonialsService.getTestimonialById(testimonialId);
  }
}
