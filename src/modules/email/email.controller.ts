import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Delete,
  Patch,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplate } from './entities/email-template.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from 'src/guards/super-admin.guard';

@UseGuards(SuperAdminGuard)
@ApiBearerAuth()
@ApiTags('Email Templates')
@Controller('email-template')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new email template' })
  @ApiResponse({
    status: 201,
    description: 'Template has been successfully created',
    type: EmailTemplate,
  })
  @ApiResponse({
    status: 400,
    description: 'Template name already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error if an unexpected error occurs',
  })
  async createEmailTemplate(@Body() createEmailTemplateDto: CreateEmailTemplateDto): Promise<any> {
    return await this.emailService.createEmailTemplate(createEmailTemplateDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch one email template' })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
    type: EmailTemplate,
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  async getEmailTemplate(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return await this.emailService.getEmailTemplate(id);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all email templates' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    type: EmailTemplate,
  })
  async getAllEmailTemplates(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number
  ) {
    return this.emailService.getAllEmailTemplates(page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an email template' })
  @ApiResponse({
    status: 201,
    description: 'Template has been successfully updated',
    type: EmailTemplate,
  })
  @ApiResponse({
    status: 400,
    description: 'Template name already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error if an unexpected error occurs',
  })
  async updateEmailTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto
  ) {
    return this.emailService.updateEmailTemplate(id, updateEmailTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an email template' })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  async deleteEmailTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return await this.emailService.deleteEmailTemplate(id);
  }
}
