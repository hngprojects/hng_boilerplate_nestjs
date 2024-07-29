import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  postgresql: {
    POSTGRESQL_TYPE: process.env.DB_TYPE as string,
    POSTGRESQL_USER: process.env.DB_USERNAME as string,
    POSTGRESQL_USER_PASSWORD: process.env.DB_PASSWORD as string,
    POSTGRESQL_HOST: process.env.DB_HOST as string,
    POSTGRESQL_DATABASE: process.env.DB_DATABASE as string,
    POSTGRESQL_ENTITIES: process.env.DB_DATABASE as string,
    POSTGRESQL_MIGRATIONS: process.env.DB_MIGRATIONS as string,
    POSTGRESQL_SSL: process.env.DB_SSL as string,
    POSTGRESQL_PORT: parseInt(process.env.POSTGRESQL_PORT!),
  },
}));
