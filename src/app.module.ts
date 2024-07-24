import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import serverConfig from '../config/server.config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from './database/data-source';
import { SeedingModule } from './database/seeding/seeding.module';
import HealthController from './health.controller';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Product } from './entities/product.entity';
import { Organisation } from './entities/organisation.entity';
import { ExportModule } from './export/export.module';
import { ExportController } from './export/export.controller';
import { ExportService } from './export/export.service';

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
    ExportService,
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
        entities: [User, Profile, Product, Organisation],
      }),
      dataSourceFactory: async () => dataSource,
    }),
    SeedingModule,
    ExportModule,
  ],
  controllers: [HealthController, ExportController],
})
export class AppModule {}
