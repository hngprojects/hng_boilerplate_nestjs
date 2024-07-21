import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SeedingService } from './database/seeding.service';
import dataSource from './database/data-source';
import { DataSource } from 'typeorm';
import { setupRoutes } from './routes';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);

  const dataSource = app.get(DataSource);

  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize();
      logger.log('Database connection initialized successfully');
    } catch (error) {
      logger.error('Error initializing database connection:', error.message);
      process.exit(1);
    }
  } else {
    logger.log('Database connection is already initialized');
  }

  const seedingService = app.get(SeedingService);
  await seedingService.seedDatabase();

  app.enable('trust proxy');
  app.setGlobalPrefix('api/v1');
  app.useLogger(logger);
  app.enableCors();

  // TODO: set options for swagger docs
  const options = new DocumentBuilder()
    .setTitle('<project-title-here>')
    .setDescription('<project-description-here>')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const server = app.getHttpAdapter().getInstance();
  setupRoutes(server, seedingService);

  const port = app.get<ConfigService>(ConfigService).get<number>('server.port') || 3008;
  await app.listen(port);

  logger.log({ message: 'server started 🚀', port, url: `http://localhost:${port}/api` });
}
bootstrap();
