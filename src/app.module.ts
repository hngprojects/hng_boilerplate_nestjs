import { MailerModule } from '@nestjs-modules/mailer';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import serverConfig from '../config/server.config';
import dataSource from './database/data-source';
import { SeedingModule } from './database/seeding/seeding.module';
import HealthController from './health.controller';
import ProbeController from './probe.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OtpModule } from './modules/otp/otp.module';
import { OtpService } from './modules/otp/otp.service';
import { TimezonesModule } from './modules/timezones/timezones.module';
import authConfig from '../config/auth.config';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { AuthGuard } from './guards/auth.guard';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SqueezeModule } from './modules/squeeze/squeeze.module';
import { EmailService } from './modules/email/email.service';
import { EmailModule } from './modules/email/email.module';
import { InviteModule } from './modules/invite/invite.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { NotificationSettingsModule } from './modules/settings/notification-settings/notification-settings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProductsModule } from './modules/products/products.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  providers: [
    {
      provide: 'CONFIG',
      useClass: ConfigService,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
    },
    OtpService,
    EmailService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      /**
       * By default, the package looks for a .env file in the root directory of the application.
       * We don't use ".env" file because it is prioritize as the same level as real environment variables.
       * To specify multiple .env files, set the envFilePath property.
       * If a variable is found in multiple files, the first one takes precedence.
       */
      envFilePath: ['.env.development.local', `.env.${process.env.PROFILE}`],
      isGlobal: true,
      load: [serverConfig, authConfig],
      /**
       * See ".env.local" file to list all environment variables needed by the app
       */
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').required(),
        PROFILE: Joi.string().valid('local', 'development', 'production', 'ci', 'testing', 'staging').required(),
        PORT: Joi.number().required(),
      }),
    }),
    LoggerModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...dataSource.options,
      }),
      dataSourceFactory: async () => dataSource,
    }),
    SeedingModule,
    AuthModule,
    TimezonesModule,
    UserModule,
    OtpModule,
    TestimonialsModule,
    EmailModule,
    InviteModule,
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
    OrganisationsModule,
    NotificationSettingsModule,
    SqueezeModule,
    TestimonialsModule,
    NotificationsModule,
    JobsModule,
    ProductsModule,
    JobsModule,
    ProfileModule,
  ],
  controllers: [HealthController, ProbeController],
})
export class AppModule {}
