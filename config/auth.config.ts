import { registerAs } from '@nestjs/config';
export default registerAs('auth', () => ({
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY_TIMEFRAME,
}));