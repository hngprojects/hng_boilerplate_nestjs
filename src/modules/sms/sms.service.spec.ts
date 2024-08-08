import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { Twilio } from 'twilio';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { HttpStatus } from '@nestjs/common';
import smsConfig from '../../../config/sms.config';
import { CreateSmsDto } from './dto/create-sms.dto';
import { VALID_PHONE_NUMBER_REQUIRED } from '../../helpers/SystemMessages';

jest.mock('twilio');

describe('SmsService', () => {
  let service: SmsService;
  let twilioClientMock: {
    messages: {
      create: jest.Mock<any, any>;
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService],
    }).compile();

    service = module.get<SmsService>(SmsService);

    // Manually mock the methods you need
    twilioClientMock = {
      messages: {
        create: jest.fn(),
      },
    };

    // Assign the mock to the service's Twilio client
    (service as any).twilioClient = twilioClientMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should send SMS successfully', async () => {
      // Arrange
      const createSmsDto: CreateSmsDto = {
        phone_number: '+2349051837045',
        message: 'Test message',
      };
      const twilioResponse = {
        sid: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      };
      twilioClientMock.messages.create.mockResolvedValue(twilioResponse);

      // Act
      const result = await service.sendSms(createSmsDto);

      // Assert
      expect(result).toEqual({
        message: 'SMS sent successfully.',
        data: {
          sid: twilioResponse.sid,
        },
      });
      expect(twilioClientMock.messages.create).toHaveBeenCalledWith({
        body: createSmsDto.message,
        from: smsConfig().phoneNumber,
        to: createSmsDto.phone_number,
      });
    });

    it('should throw a CustomHttpException when Twilio returns a 400 error', async () => {
      // Arrange
      const createSmsDto: CreateSmsDto = {
        phone_number: '+2349051837045',
        message: 'Test message',
      };
      const error = {
        status: 400,
        message: 'Bad Request',
      };
      twilioClientMock.messages.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendSms(createSmsDto)).rejects.toThrow(
        new CustomHttpException(VALID_PHONE_NUMBER_REQUIRED, HttpStatus.BAD_REQUEST)
      );
    });
  });
});
