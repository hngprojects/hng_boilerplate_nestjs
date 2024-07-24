import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { CustomExceptionFilter } from '../../helpers/custom-exception.filter';
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
  @UseGuards(AuthGuard)
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @Req() req: Request
  ): Promise<CreateTestimonialResponseDto> {
    const { sub: userId } = req?.user as { sub: string };

    const data = await this.testimonialsService.create(createTestimonialDto, userId);

    return {
      status: 'success',
      message: 'Testimonial created successfully',
      data,
    };
  }

  @Delete(':id')
  async deleteTestimonial(@Param('id', ParseUUIDPipe) id: string) {
    await this.testimonialsService.deleteTestimonial(id);

    return {
      success: true,
      message: 'Testimonial deleted successfully',
      status_code: HttpStatus.OK,
    };
  }
}
