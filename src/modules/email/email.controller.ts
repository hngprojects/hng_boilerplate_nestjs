import { Controller, Post, Get, Body, Res, Patch, Param, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';
import { SendEmailDto, UpdateTemplateDto, createTemplateDto, getTemplateDto } from './dto/email.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

@ApiTags('email')
@Controller('email')
@UseGuards(SuperAdminGuard)
export class EmailController {
  constructor(private emailService: EmailService) {}

  @ApiOperation({ summary: 'Store a new email template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid HTML format' })
  @Post('store-template')
  async storeTemplate(@Body() body: createTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.createTemplate(body);
    res.status(response.status_code).send(response);
  }

  @ApiOperation({ summary: 'Update an existing email template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid HTML format' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiParam({ name: 'templateName', required: true, description: 'The name of the template to update' })
  @Patch('update-template/:templateName')
  @UseGuards(SuperAdminGuard)
  async updateTemplate(
    @Param('templateName') name: string,
    @Body() body: UpdateTemplateDto,
    @Res() res: Response
  ): Promise<any> {
    const response = await this.emailService.updateTemplate(name, body);
    res.status(response.status_code).send(response);
  }

  @ApiOperation({ summary: 'Retrieve an email template' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Post('get-template')
  async getTemplate(@Body() body: getTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.getTemplate(body);
    res.status(response.status_code).send(response);
  }

  @ApiOperation({ summary: 'Delete an email template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Post('delete-template')
  async deleteTemplate(@Body() body: getTemplateDto, @Res() res: Response): Promise<any> {
    const response = await this.emailService.deleteTemplate(body);
    res.status(response.status_code).send(response);
  }

  @ApiOperation({ summary: 'Retrieve all email templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @Get('get-all-templates')
  async getAllTemplates(@Res() res: Response): Promise<any> {
    const response = await this.emailService.getAllTemplates();
    res.status(response.status_code).send(response);
  }
}
