import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './create-faq.dto';
import { Faq } from './faq.entity';
import { ICreateFaqResponse, IFaq } from './faq.interface';

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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createFaqDto: CreateFaqDto): Promise<ICreateFaqResponse> {
    const faq: IFaq = await this.faqService.create(createFaqDto);
    return {
      status_code: 201,
      success: true,
      data: faq,
    };
  }
}
