import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import serverConfig from '../config/server.config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './user/user.module';
import { OrganisationModule } from './organisation/organisation.module';
import { ProductsModule } from './products/products.module';
import { ProfileModule } from './profile/profile.module';
import { dataSourceOptions } from '../src/database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    UserModule,
    OrganisationModule,
    ProductsModule,
    ProfileModule,
    SeedingModule,
  ],
})
export class AppModule {}

// import { Module, ValidationPipe } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { APP_PIPE } from '@nestjs/core';
// import serverConfig from '../config/server.config';
// import * as Joi from 'joi';
// import { UserModule } from './user/user.module';
// import { OrganisationModule } from './organisation/organisation.module';
// import { ProductsModule } from './products/products.module';
// import { ProfileModule } from './profile/profile.module';
// import { dataSourceOptions } from './db-dataSource';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingModule } from './database/seeding/seeding.module';

// @Module({
//   providers: [
//     {
//       provide: 'CONFIG',
//       useClass: ConfigService,
//     },
//     {
//       provide: APP_PIPE,
//       useFactory: () =>
//         new ValidationPipe({
//           whitelist: true,
//           forbidNonWhitelisted: true,
//         }),
//     },
//   ],
//   imports: [
//     TypeOrmModule.forRoot(dataSourceOptions),
//     UserModule,
//     OrganisationModule,
//     ProductsModule,
//     ProfileModule,

//     /**
//      * By default, the package looks for a .env file in the root directory of the application.
//      * We don't use ".env" file because it is prioritize as the same level as real environment variables.
//      * To specify multiple .env files, set the envFilePath property.
//      * If a variable is found in multiple files, the first one takes precedence.
//      */
//     envFilePath: ['.env.development.local', `.env.${process.env.PROFILE}`],
//     isGlobal: true,
//     load: [serverConfig],
//     /**
//      * See ".env.local" file to list all environment variables needed by the app
//      */
//     validationSchema: Joi.object({
//       NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').required(),
//       PROFILE: Joi.string().valid('local', 'development', 'production', 'ci', 'testing', 'staging').required(),
//       PORT: Joi.number().required(),
//     }),
//   ],
// })
// export class AppModule {}
