import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import {User} from '../entities/user.entity';
import {Organisation} from '../entities/organisation.entity';
import {Profile} from '../entities/profile.entity';
import {Product} from '../entities/product.entity';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';



export const dataSourceOptions = {
  type: process.env.DB_TYPE as 'postgres',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'testDB',
  entities: [User, Organisation, Profile, Product ],
  migrations: [process.env.DB_MIGRATIONS],
  synchronize: true,
  port: 5432
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
