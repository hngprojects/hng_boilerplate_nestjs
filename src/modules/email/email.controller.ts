import { Controller, Post, Get, Body, Res, Patch, Param } from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';
import { skipAuth } from '../../helpers/skipAuth';
import { SendEmailDto, UpdateTemplateDto, createTemplateDto, getTemplateDto } from './dto/email.dto';
import { skip } from 'node:test';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('store-template')
  async storeTemplate(@Body() body: createTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.createTemplate(body);
    res.status(response.status_code).send(response);
  }

  @Patch('update-template/:templateName')
  async updateTemplate(
    @Param('templateName') name: string,
    @Body() body: UpdateTemplateDto,
    @Res() res: Response
  ): Promise<any> {
    const response = await this.emailService.updateTemplate(name, body);
    res.status(response.status_code).send(response);
  }

  @Post('get-template')
  async getTemplate(@Body() body: getTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.getTemplate(body);
    res.status(response.status_code).send(response);
  }

  @Post('delete-template')
  async deleteTemplate(@Body() body: getTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.getTemplate(body);
    res.status(response.status_code).send(response);
  }

  @Get('get-all-templates')
  async getAllTemplates(@Res() res: Response): Promise<any> {
    const response = await this.emailService.getAllTemplates();
    res.status(response.status_code).send(response);
  }
}
