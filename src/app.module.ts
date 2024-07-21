import { HttpStatus, Module, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import serverConfig from '../config/server.config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import HealthController from './health.controller';
import dataSource, { dataSourceOptions } from '../src/database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './database/seeding.service';
import { AuthModule } from './modules/auth.module';
import { ValidationError } from 'class-validator';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          exceptionFactory: (validationErrors: ValidationError[] = []) => {
            return new UnprocessableEntityException({
              message: 'Bad Request',
              error: validationErrors.map(error => Object.values(error.constraints)[0])[0],
              status_code: HttpStatus.UNPROCESSABLE_ENTITY,
            });
          },
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
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
      // validationSchema: Joi.object({
      //   NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').required(),
      //   PROFILE: Joi.string().valid('local', 'development', 'production', 'ci', 'testing', 'staging').required(),
      //   PORT: Joi.number().required(),
      // }),
    }),
    LoggerModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
