import { Controller, Get, Param, UseGuards, Request, HttpCode, Query } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailService } from './email.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Email')
@Controller('email/templates')
export class EmailController {
  constructor(private readonly emailSevice: EmailService) {}

  //   @UseGuards(JwtAuthGuard)
  @Get(':templateName')
  @ApiOperation({ summary: 'Get Email Template' })
  @ApiResponse({ status: 200, description: 'Email template retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  async getEmailTemplate(@Request() req: Request, @Param('templateName') templateName: string) {
    const content = await this.emailSevice.getTemplate(templateName);
    return content;
  }
}
