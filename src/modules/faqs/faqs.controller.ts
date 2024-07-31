import { Body, Controller, Post, Req, Patch, Param } from '@nestjs/common';
import { CreateFaqDto, UpdateFaqDto } from './dto/createFaqsDto';
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
  @Patch('/:id')
  async handleUpdateFaqs(@Req() req, @Param('id') id: string, @Body() updateFaqs: UpdateFaqDto) {
    const user = req['user'];
    return this.faqService.updateFaqs(updateFaqs, id, user.id);
  }
}
