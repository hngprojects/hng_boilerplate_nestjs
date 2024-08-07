import { registerAs } from '@nestjs/config';

export default registerAs('sms', () => ({
  acountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
}));
