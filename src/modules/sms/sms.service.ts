import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import smsConfig from 'config/sms.config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;
  constructor() {
    const accountSid = smsConfig().acountSid;
    const authToken = smsConfig().authToken;
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendSms(to: string, body: string) {
    const from = smsConfig().phoneNumber;
    return await this.twilioClient.messages.create({
      body,
      from,
      to,
    });
  }
}
