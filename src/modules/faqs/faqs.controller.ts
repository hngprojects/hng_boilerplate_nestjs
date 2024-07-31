import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateFaqDto } from './dto/createFaqsDto';
import { FaqsService } from './faqs.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('faqs')
@ApiTags('faqs')
export class FaqsController {
  constructor(private readonly faqService: FaqsService) {}

  @Post('/')
  async handleCreateFaqs(@Req() req, @Body() createFaqs: CreateFaqDto) {
    const user = req['user'];

    return this.faqService.createFaqs(createFaqs, user.id);
  }
}
