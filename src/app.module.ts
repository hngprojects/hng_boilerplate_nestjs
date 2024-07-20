import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import serverConfig from '../config/server.config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import HealthController from './health.controller';
import { dataSourceOptions } from '../src/database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './database/seeding.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import UserService from './services/user.service';
import RegistrationController from './controllers/registration.controller';
import { appConfig } from 'config/appConfig';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as dotenv from 'dotenv';
import { AuthGuard } from './guards/auth.guard';

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
    },{
      provide: "APP_GUARD",
      useClass: AuthGuard
    },
    SeedingService, UserService,
    Repository
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
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: appConfig.jwt.jwtSecret,
      signOptions: { expiresIn: `${appConfig.jwt.jwtExpiry}s` },
    }),
  ],
  controllers: [HealthController, RegistrationController]
})
export class AppModule {}