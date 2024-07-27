import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send user confirmation email', async () => {
    const email = 'test@example.com';
    const url = 'http://example.com/confirm';
    const token = 'mike';
    const link = `${url}?token=${token}`;

    await service.sendUserConfirmationMail(email, url, token);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation',
      context: {
        link,
        email,
      },
    });
  });

  it('should send forgot password email', async () => {
    const email = 'test@example.com';
    const url = 'http://example.com/reset';
    const token = 'mike';
    const link = `${url}?token=${token}`;

    await service.sendForgotPasswordMail(email, url, token);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Reset Password',
      template: 'reset-password',
      context: {
        link,
        email,
      },
    });
  });

  it('should send waitlist confirmation email', async () => {
    const email = 'test@example.com';
    const url = 'http://example.com/waitlist';

    await service.sendWaitListMail(email, url);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Waitlist Confirmation',
      template: 'waitlist',
      context: {
        url,
        email,
      },
    });
  });

  it('should send newsletter email', async () => {
    const email = 'test@example.com';
    const articles = [
      {
        title: 'Article Title 1',
        description: 'Short description of the article.',
        link: 'https://example.com/article1',
      },
      {
        title: 'Article Title 2',
        description: 'Short description of the article.',
        link: 'https://example.com/article2',
      },
    ];
    await service.sendNewsLetterMail(email, articles);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Monthly Newsletter',
      template: 'newsletter',
      context: {
        email,
        articles,
      },
    });
  });
});
