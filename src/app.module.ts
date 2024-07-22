import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import serverConfig from '../config/server.config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from './database/data-source';
import { SeedingModule } from './database/seeding/seeding.module';
import { OrganisationsController } from './organisations/organisations.controller';
import { OrganisationsService } from './organisations/organisations.service';
import HealthController from './health.controller';
import { Organisation } from './entities/organisation.entity';

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
    OrganisationsService,
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', `.env.${process.env.PROFILE}`],
      isGlobal: true,
      load: [serverConfig],
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
        entities: [Organisation], // Add the Organisation entity here
      }),
      dataSourceFactory: async () => dataSource,
    }),
    TypeOrmModule.forFeature([Organisation]), // Register Organisation entity
    SeedingModule,
  ],
  controllers: [HealthController, OrganisationsController],
})
export class AppModule {}
