import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateFaqDto } from './dto/createFaqsDto';
import { FaqsService } from './faqs.service';

@Controller('faqs')
@UseGuards()
export class FaqsController {
  constructor(private readonly faqService: FaqsService) {}
  @Post('/')
  async handleCreateFaqs(@Req() req, @Body() createFaqs: CreateFaqDto) {
    const user = req['user'];

    return this.faqService.createFaq(createFaqs, user.id);
  }
}
