import * as dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
    jwt: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiry: process.env.JWT_EXPIRY_TIMEFRAME
    }
    
}

