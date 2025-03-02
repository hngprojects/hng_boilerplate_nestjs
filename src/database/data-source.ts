import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

const dataSource = new DataSource({
  type: (process.env.DB_TYPE as 'postgres') || 'postgres', // Default to 'postgres'
  username: process.env.DB_USERNAME || 'andre',
  password: process.env.DB_PASSWORD || 'Damilare12345',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mydatabase',
  entities: [process.env.DB_ENTITIES || 'dist/**/*.entity{.ts,.js}'], // Ensure default value
  migrations: [process.env.DB_MIGRATIONS || 'dist/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true',
});
export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
