import { DatabaseType, DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

const db: DatabaseType = 'postgres';

export const dataSourceOptions = {
  type: db,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD as string,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  entities: [process.env.DB_ENTITIES],
  migrations: [process.env.DB_MIGRATIONS],
  synchronize: isDevelopment,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
