import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './create-faq.dto';
import { Faq } from './faq.entity';

@ApiTags('faqs')
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({
    status: 201,
    description: 'The FAQ has been successfully created.',
    type: Faq,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request if input data is invalid.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error if an unexpected error occurs.',
  })
  async create(@Body() createFaqDto: CreateFaqDto) {
    const createdBy = 'ADMIN'; 
    const faq = await this.faqService.create(createFaqDto, createdBy);
    return {
      status_code: 201,
      success: true,
      data: faq,
    };
  }
}
