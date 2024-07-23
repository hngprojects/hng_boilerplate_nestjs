import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import serverConfig from '../config/server.config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import dataSource from './database/data-source';
import { SeedingModule } from './database/seeding/seeding.module';
import HealthController from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './database/seeding.service';
import * as dotenv from 'dotenv';
import { AuthGuard } from './guards/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';




dotenv.config();
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
    }, {
      provide: "APP_GUARD",
      useClass: AuthGuard
    },
    SeedingService,

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
      load: [serverConfig],
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
        autoLoadEntities: true
      }),
      dataSourceFactory: async () => dataSource,
    }),
    SeedingModule,
    AuthModule,
    UserModule

  ],
  controllers: [HealthController],
})
export class AppModule { }
