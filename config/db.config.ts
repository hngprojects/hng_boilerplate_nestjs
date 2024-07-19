import { Waitlist } from '../src/database/entities/waitlist.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const config: PostgresConnectionOptions = {
  type: 'postgres',
  database: 'hng',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  entities: [Waitlist],
  synchronize: true,
};

export default config;
