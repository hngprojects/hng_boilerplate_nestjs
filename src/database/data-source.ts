import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [process.env.DB_ENTITIES],
  migrations: [process.env.DB_MIGRATIONS],
  synchronize: isDevelopment,
  migrationsTableName: 'migrations',
  ssl: {
    rejectUnauthorized: false, // This is necessary for Heroku
  },
};

const dataSource = new DataSource(dataSourceOptions);

export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
