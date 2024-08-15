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
  HttpStatus,
  Delete,
  Patch,
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
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { UpdateTestimonialResponseDto } from './dto/update-testimonial.response.dto';

@ApiBearerAuth()
@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly userService: UserService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Testimonials' })
  @ApiResponse({ status: 201, description: 'Testimonial created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @Req() req: { user: UserPayload; language: string }
  ): Promise<CreateTestimonialResponseDto> {
    const language = req.language;
    const userId = req.user.id;

    const user = await this.userService.getUserRecord({ identifier: userId, identifierType: 'id' });

    const data = await this.testimonialsService.createTestimonial(createTestimonialDto, user, language);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data,
    };
  }

  @Get('user/:user_id')
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
  async getAllTestimonials(
    @Param('user_id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('page_size', new DefaultValuePipe(3), ParseIntPipe) page_size: number,
    @Req() req: { language: string }
  ) {
    const language = req.language;
    return this.testimonialsService.getAllTestimonials(userId, page, page_size, language);
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
  async getTestimonialById(
    @Param('testimonial_id', ParseUUIDPipe) testimonialId: string,
    @Req() req: { language: string }
  ) {
    const language = req.language;

    const testimonial = await this.testimonialsService.getTestimonialById(testimonialId, language);

    return {
      status_code: HttpStatus.OK,
      message: 'Testimonial fetched successfully',
      data: testimonial,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Testimonial' })
  @ApiResponse({ status: 200, description: 'Testimonial deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTestimonial(@Param('id') id: string) {
    return this.testimonialsService.deleteTestimonial(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Testimonial' })
  @ApiResponse({ status: 200, description: 'Testimonial updated successfully' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param('id') id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @Req() req: { user: UserPayload; language: string }
  ): Promise<UpdateTestimonialResponseDto> {
    const language = req.language;
    const userId = req.user.id;

    const data = await this.testimonialsService.updateTestimonial(id, updateTestimonialDto, userId, language);

    return {
      status: 'success',
      message: 'Testimonial updated successfully',
      data,
    };
  }
}
