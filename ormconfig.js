const config = require('dotenv').config;
config();

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  retryAttempts: 3,
  retryDelay: 3000,
  migrations: ['src/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};
