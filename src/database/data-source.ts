import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import {User} from '../entities/user.entity';
import {Organisation} from '../entities/organisation.entity';
import {Profile} from '../entities/profile.entity';
import {Product} from '../entities/product.entity';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';



const dataSource = new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  entities: [process.env.DB_ENTITIES],
  migrations: [process.env.DB_MIGRATIONS],
  synchronize: isDevelopment,
  migrationsTableName: 'migrations',
});

export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
