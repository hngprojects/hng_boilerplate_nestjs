import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';
console.log(isDevelopment);


export const dataSourceOptions = {
  type: process.env.DB_TYPE as 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  entities: [process.env.DB_ENTITIES],
  migrations: [process.env.DB_MIGRATIONS],
  synchronize: isDevelopment,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
