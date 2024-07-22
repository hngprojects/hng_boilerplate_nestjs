import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { RoleGuard } from '../auth/role.guard';
import { Role } from '../auth/roles.decorator';
import { Roles } from '../auth/roles.enum';

@Controller('/faqs')
@UseGuards(RoleGuard)
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @Role(Roles.ADMIN) // Use the Roles enum for consistency
  async create(@Body() createFaqDto: CreateFaqDto) {
    try {
      return await this.faqsService.create(createFaqDto);
    } catch (error) {
      throw new HttpException('Failed to create FAQ entry', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.faqsService.findAll();
    } catch (error) {
      throw new HttpException('Failed to retrieve FAQ entries', HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @Role(Roles.ADMIN) // Use the Roles enum for consistency
  async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    try {
      return await this.faqsService.update(id, updateFaqDto);
    } catch (error) {
      throw new HttpException('Failed to update FAQ entry', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @Role(Roles.ADMIN) // Use the Roles enum for consistency
  async remove(@Param('id') id: string) {
    try {
      await this.faqsService.remove(id);
      return { message: 'FAQ entry deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete FAQ entry', HttpStatus.BAD_REQUEST);
    }
  }
}
