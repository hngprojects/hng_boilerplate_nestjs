import { Controller, Get, Param, UseGuards, Request, HttpCode, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Email')
@Controller('email/templates')
export class EmailController {
  constructor(private readonly emailSevice: EmailService) {}

  @Get(':templateName')
  @ApiOperation({ summary: 'Get Email Template' })
  @ApiResponse({ status: 200, description: 'Email template retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  async getEmailTemplate(@Request() req: Request, @Param('templateName') templateName: string) {
    const content = await this.emailSevice.getTemplate(templateName);
    return content;
  }
  @Get()
  @ApiOperation({ summary: 'Get All Email Templates' })
  @ApiResponse({ status: 200, description: 'Email templates retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'There are No Email Templates Available' })
  async getAllEmailTemplate(
    @Request() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const content = await this.emailSevice.getAllTemplates(page, limit);
    return content;
  }
}
