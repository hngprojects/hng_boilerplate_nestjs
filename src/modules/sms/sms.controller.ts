import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmsDto } from './dto/create-sms.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('/send')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send an sms' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiResponse({ status: 404, description: 'A valid phone number must be provided' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendSms(@Body() createSmsDto: CreateSmsDto) {
    return this.smsService.sendSms(createSmsDto);
  }
}
