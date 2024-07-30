import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';
import { skipAuth } from '../../helpers/skipAuth';
import { SendEmailDto } from './dto/email.dto';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @skipAuth()
  @Post('send-confirmation-otp')
  async sendEmailConfirmationOtp(@Body() body: SendEmailDto, @Res() response: Response): Promise<any> {
    await this.emailService.sendEmail(body);
    return response.status(200).json({ message: 'Email confirmation OTP sent successfully' });
  }
}
