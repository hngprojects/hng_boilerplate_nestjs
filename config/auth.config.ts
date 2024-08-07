import { registerAs } from '@nestjs/config';
export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY_TIMEFRAME,
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY_TIMEFRAME,
  google: {
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    clientID: process.env.GOOGLE_CLIENT_ID,
    callbackURL: process.env.GOOGLE_REDIRECT_URI,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
}));
