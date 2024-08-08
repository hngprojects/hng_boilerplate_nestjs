import { Controller, Post, Get, Body, Res, UseGuards, Query, Delete } from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { SendEmailDto, createTemplateDto, getTemplateDto } from './dto/email.dto';
import { skip } from 'node:test';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Emails')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @UseGuards(SuperAdminGuard)
  @Post('store-template')
  async storeTemplate(@Body() body: createTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.createTemplate(body);
    res.status(response.status_code).send(response);
  }

  @UseGuards(SuperAdminGuard)
  @Get('get-template')
  async getTemplate(@Query() query: getTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.getTemplate(query);
    res.status(response.status_code).send(response);
  }

  @UseGuards(SuperAdminGuard)
  @Delete('delete-template')
  async deleteTemplate(@Body() body: getTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.deleteTemplate(body);
    res.status(response.status_code).send(response);
  }

  @UseGuards(SuperAdminGuard)
  @Get('get-all-templates')
  async getAllTemplates(@Res() res: Response): Promise<any> {
    const response = await this.emailService.getAllTemplates();
    res.status(response.status_code).send(response);
  }
}
