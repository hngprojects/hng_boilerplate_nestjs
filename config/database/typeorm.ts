import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv'
dotenv.config()

const databaseConnectionObject = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + 'src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + 'src/**/migrations/*{.ts,.js}'],
  synchronize: false,
  retryAttempts: 3,
  retryDelay: 3000,
}

const config = {
  ...databaseConnectionObject,
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default registerAs(
  'typeorm',
  () => ({
    ...databaseConnectionObject,
    namingStrategy: new SnakeNamingStrategy(),

  })
);

export const connectionSource = new DataSource(config as DataSourceOptions);
