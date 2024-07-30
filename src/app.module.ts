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
import ProbeController from './probe.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OtpModule } from './modules/otp/otp.module';
import { TimezonesModule } from './modules/timezones/timezones.module';
import authConfig from '../config/auth.config';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { AuthGuard } from './guards/auth.guard';
import { SqueezeModule } from './modules/squeeze/squeeze.module';
import { EmailModule } from './modules/email/email.module';
import { InviteModule } from './modules/invite/invite.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { NotificationSettingsModule } from './modules/settings/notification-settings/notification-settings.module';
import { ProductsModule } from './modules/products/products.module';
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
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ConfigModule.forRoot({
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
    OrganisationsModule,
    NotificationSettingsModule,
    SqueezeModule,
    ProductsModule,
    ProfileModule,
  ],
  controllers: [HealthController, ProbeController],
})
export class AppModule {}
