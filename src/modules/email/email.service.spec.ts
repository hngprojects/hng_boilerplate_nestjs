import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from './dto/email.dto';

describe('EmailService', () => {
  let service: EmailService;
  let emailQueue: Queue;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken('email'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    emailQueue = module.get<Queue>(getQueueToken('email'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email', async () => {
    const emailData = new SendEmailDto();
    emailData.to = 'test@example.com';
    emailData.subject = 'Test Subject';
    emailData.template = 'test-template';
    emailData.context = { key: 'value' };

    await service.sendEmail(emailData);

    expect(emailQueue.add).toHaveBeenCalledWith({
      to: emailData.to,
      subject: emailData.subject,
      template: emailData.template,
      context: emailData.context,
    });
  });
});
