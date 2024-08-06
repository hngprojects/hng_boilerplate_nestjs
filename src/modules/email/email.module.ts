import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './email.service';
import QueueService from './queue.service';
import authConfig from 'config/auth.config';
import EmailQueueConsumer from './email.consumer';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailController } from './email.controller';

@Module({
  providers: [EmailService, QueueService, EmailQueueConsumer],
  exports: [EmailService, QueueService],
  imports: [
    BullModule.registerQueueAsync({
      name: 'emailSending',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: `"Team Remote Bingo" <${configService.get<string>('SMTP_USER')}>`,
        },
        template: {
          dir: process.cwd() + '/src/modules/email/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [EmailController],
})
export class EmailModule {}
