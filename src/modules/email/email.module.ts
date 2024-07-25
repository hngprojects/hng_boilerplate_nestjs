import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';

@Module({
  providers: [EmailService, MailerService],
  exports: [EmailService],
})
export class EmailModule {}
