import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import serverConfig from '../config/server.config';
import dataSource from './database/data-source';
import { SeedingModule } from './database/seeding/seeding.module';
import HealthController from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { InviteModule } from './modules/invite/invite.module';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { OtpModule } from './modules/otp/otp.module';
import authConfig from '../config/auth.config';
import { AuthGuard } from './guards/auth.guard';
import { ProductsModule } from './modules/products/products.module';
import { BillingPlanModule } from './modules/billing-plans/billing-plan.module';
import { NotificationSettingsModule } from './modules/notification-settings/notification-settings.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SqueezeModule } from './modules/squeeze/squeeze.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { TimezonesModule } from './modules/timezones/timezones.module';
import { UserModule } from './modules/user/user.module';
import ProbeController from './probe.controller';
import { RunTestsModule } from './run-tests/run-tests.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganisationRoleModule } from './modules/organisation-role/organisation-role.module';
import { OrganisationPermissionsModule } from './modules/organisation-permissions/organisation-permissions.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { FaqModule } from './modules/faq/faq.module';
import { HelpCenterModule } from './modules/help-center/help-center.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { NewsletterSubscriptionModule } from './modules/newsletter-subscription/newsletter-subscription.module';
import { TeamsModule } from './modules/teams/teams.module';
import { BlogModule } from './modules/blogs/blogs.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

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
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      /*
       * By default, the package looks for a env file in the root directory of the application.
       * We don't use ".env" file because it is prioritize as the same level as real environment variables.
       * To specify multiple. env files, set the envFilePath property.
       * If a variable is found in multiple files, the first one takes precedence.
       */
      envFilePath: ['.env.development.local', `.env.${process.env.PROFILE}`],
      isGlobal: true,
      load: [serverConfig, authConfig],
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
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: authConfig().redis.host,
          port: +authConfig().redis.port,
          password: authConfig().redis.password,
          username: authConfig().redis.username,
        },
      }),
    }),
    OrganisationsModule,
    SqueezeModule,
    NotificationSettingsModule,
    SqueezeModule,
    TestimonialsModule,
    JobsModule,
    NotificationsModule,
    ProductsModule,
    BillingPlanModule,
    JobsModule,
    ProfileModule,
    OrganisationRoleModule,
    OrganisationPermissionsModule,
    RunTestsModule,
    ContactUsModule,
    FaqModule,
    HelpCenterModule,
    NotificationsModule,
    WaitlistModule,
    NewsletterSubscriptionModule,
    TeamsModule,
    BlogModule,
    SubscriptionsModule,
  ],
  controllers: [HealthController, ProbeController],
})
export class AppModule {}
