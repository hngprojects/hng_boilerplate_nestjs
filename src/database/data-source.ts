import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { Product } from '../../src/entities/product.entity';
import { User } from '../../src/entities/user.entity';
import { Profile } from '../../src/entities/profile.entity';
import { Organisation } from '../../src/entities/organisation.entity';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

const dataSource = new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  entities: [Product, User, Profile, Organisation],
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
