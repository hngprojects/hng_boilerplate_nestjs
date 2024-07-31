import { Controller, Get, Body, Put, Param, Delete } from '@nestjs/common';
import { FaqService } from './faq.service';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { skipAuth } from '../../helpers/skipAuth';
import { Faq } from './entities/faq.entity';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqsService: FaqService) {}

  @skipAuth()
  @Get()
  @ApiOperation({ summary: 'Get all frequently asked questions' })
  async findAll() {
    return this.faqsService.findAllFaq();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing FAQ' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'The FAQ has been successfully updated.', type: Faq })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqsService.updateFaq(id, updateFaqDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'The FAQ has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async remove(@Param('id') id: string) {
    return this.faqsService.removeFaq(id);
  }
}
