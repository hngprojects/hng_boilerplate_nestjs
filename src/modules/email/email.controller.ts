import { Controller, Post, Get, Body, Res, Delete, Patch, Param, Query, DefaultValuePipe, ParseIntPipe, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';
import { skipAuth } from '../../helpers/skipAuth';
import { SendEmailDto, getTemplateDto } from './dto/email.dto';
import { skip } from 'node:test';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Controller('email-template')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @skipAuth()
  @Post()
  async createEmailTemplate(@Body() createEmailTemplateDto: CreateEmailTemplateDto, @Res() res: Response): Promise<any> {
    const response =  await this.emailService.createEmailTemplate(createEmailTemplateDto);
    res.status(HttpStatus.CREATED).send(response);
  }

  @skipAuth()
  @Get(':id')
  async getEmailTemplate(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return await this.emailService.getEmailTemplate(id);
  }

  @skipAuth()
  @Get()
  async getAllEmailTemplates(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
  ){
    return this.emailService.getAllEmailTemplates(page, limit);
  }

  @skipAuth()
  @Patch(':id')
  async updateEmailTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ) {
    return this.emailService.updateEmailTemplate(id, updateEmailTemplateDto);
  }

  @skipAuth()
  @Delete(':id')
  async deleteEmailTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return await this.emailService.deleteEmailTemplate(id);
  }
}
