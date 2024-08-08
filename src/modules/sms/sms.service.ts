import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import smsConfig from 'config/sms.config';
import { Twilio } from 'twilio';
import { CreateSmsDto } from './dto/create-sms.dto';
import { CustomHttpException } from 'src/helpers/custom-http-filter';
import { VALID_PHONE_NUMBER_REQUIRED } from 'src/helpers/SystemMessages';

@Injectable()
export class SmsService {
  private logger = new Logger(SmsService.name);
  private twilioClient: Twilio;
  constructor() {
    const accountSid = smsConfig().acountSid;
    const authToken = smsConfig().authToken;
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendSms(createSmsDto: CreateSmsDto) {
    const from = smsConfig().phoneNumber;
    try {
      const response = await this.twilioClient.messages.create({
        body: createSmsDto.message,
        from,
        to: createSmsDto.phone_number,
      });
      return {
        message: 'SMS sent successfully.',
        data: {
          sid: response.sid,
        },
      };
    } catch (error) {
      if (error.status === 400) {
        throw new CustomHttpException(VALID_PHONE_NUMBER_REQUIRED, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
