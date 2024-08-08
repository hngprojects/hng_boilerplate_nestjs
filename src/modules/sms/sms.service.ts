import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { CreateSmsDto } from './dto/create-sms.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { VALID_PHONE_NUMBER_REQUIRED } from '../../helpers/SystemMessages';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private logger = new Logger(SmsService.name);
  private twilioClient: Twilio;
  private readonly accountSid;
  private readonly authToken;
  private readonly from;
  constructor(private readonly configService: ConfigService) {
    this.accountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
    this.from = configService.get<string>('TWILIO_PHONE_NUMBER');
    this.twilioClient = new Twilio(this.accountSid, this.authToken);
  }

  async sendSms(createSmsDto: CreateSmsDto) {
    try {
      const response = await this.twilioClient.messages.create({
        body: createSmsDto.message,
        from: this.from,
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
