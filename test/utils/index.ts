import { DatabaseType, DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'test';

const db: DatabaseType = 'postgres';

export const dataSourceOptions = {
  type: db,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD as string,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE_TEST,
  entities: [process.env.DB_ENTITIES_TEST],
  migrations: [process.env.DB_MIGRATIONS_TEST],
  synchronize: isDevelopment,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
