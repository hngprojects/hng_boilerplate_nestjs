import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { initializeDataSource } from './database/data-source';
import { SeedingService } from './database/seeding/seeding.service';
import { ResponseInterceptor } from './shared/inteceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);

  const dataSource = app.get(DataSource);

  try {
    await initializeDataSource();
    console.log('Data Source has been initialized!');
  } catch (err) {
    console.error('Error during Data Source initialization', err);
    process.exit(1);
  }

  const seedingService = app.get(SeedingService);
  await seedingService.seedDatabase();

  app.enable('trust proxy');
  app.useLogger(logger);
  app.enableCors();
  app.setGlobalPrefix('api/v1', { exclude: ['/', 'health', 'api', 'api/v1', 'api/docs', 'probe'] });
  // app.useGlobalInterceptors(new ResponseInterceptor());

  // TODO: set options for swagger docs
  const options = new DocumentBuilder()
    .setTitle('Remote Bingo')
    .setDescription('<project-description-here>')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  const port = app.get<ConfigService>(ConfigService).get<number>('server.port');
  await app.listen(port);

  logger.log({ message: 'server started 🚀', port, url: `http://localhost:${port}/api/v1` });
}
bootstrap().catch(err => {
  console.error('Error during bootstrap', err);
  process.exit(1);
});
