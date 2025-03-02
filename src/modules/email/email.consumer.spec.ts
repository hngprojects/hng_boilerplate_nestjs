import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import EmailQueueConsumer from './email.consumer';

describe('EmailQueueConsumer', () => {
  let emailQueueConsumer: EmailQueueConsumer;
  let mailerService: MailerService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailQueueConsumer,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue('Email sent'),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    emailQueueConsumer = module.get<EmailQueueConsumer>(EmailQueueConsumer);
    mailerService = module.get<MailerService>(MailerService);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(emailQueueConsumer).toBeDefined();
  });

  const mockJob = (data: any): Job<any> =>
    ({
      data,
    }) as Job<any>;

  it('should send a welcome email and log success', async () => {
    const job = mockJob({ mail: { to: 'test@example.com' } });
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'log');

    await emailQueueConsumer.sendWelcomeEmailJob(job);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Welcome to My App! Confirm your Email',
      template: 'Welcome-Template',
    });

    expect(loggerSpy).toHaveBeenCalledWith('Welcome email sent successfully to test@example.com');
  });

  it('should send a waitlist email and log success', async () => {
    const job = mockJob({ mail: { to: 'test@example.com' } });
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'log');

    await emailQueueConsumer.sendWaitlistEmailJob(job);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Waitlist Confirmation',
      template: 'waitlist',
    });

    expect(loggerSpy).toHaveBeenCalledWith('Waitlist email sent successfully to test@example.com');
  });

  it('should handle errors in sendWelcomeEmailJob', async () => {
    jest.spyOn(mailerService, 'sendMail').mockRejectedValue(new Error('Failed to send email'));
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'error');

    const job = mockJob({ mail: { to: 'test@example.com' } });

    await emailQueueConsumer.sendWelcomeEmailJob(job);

    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('EmailQueueConsumer ~ sendWelcomeEmailJobError:'));
  });

  it('should send a reset password email and log success', async () => {
    const payload = {
      mail: {
        to: 'test@example.com',
        context: {
          name: 'name',
          link: 'link',
          email: 'email',
        },
      },
    };

    const job = mockJob({ ...payload });
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'log');

    await emailQueueConsumer.sendResetPasswordEmailJob(job);

    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Reset Password',
        template: 'Reset-Password-Template',
        context: expect.objectContaining({
          name: 'name',
          link: 'link',
          email: 'email',
        }),
      })
    );

    expect(loggerSpy).toHaveBeenCalledWith('Reset password email sent successfully to test@example.com');
  });

  it('should send a newsletter email and log success', async () => {
    const job = mockJob({ mail: { to: 'test@example.com' } });
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'log');

    await emailQueueConsumer.sendNewsletterEmailJob(job);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Monthly Newsletter',
      template: 'newsletter',
    });

    expect(loggerSpy).toHaveBeenCalledWith('Newsletter email sent successfully to test@example.com');
  });

  it('should send a register OTP email and log success', async () => {
    const job = mockJob({ mail: { to: 'test@example.com' } });
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'log');

    await emailQueueConsumer.sendTokenEmailJob(job);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Welcome to My App! Confirm your Email',
      template: 'register-otp',
    });

    expect(loggerSpy).toHaveBeenCalledWith('Register OTP email sent successfully to test@example.com');
  });

  it('should send a login OTP email and log success', async () => {
    const job = mockJob({ mail: { to: 'test@example.com' } });
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'log');

    await emailQueueConsumer.sendLoginOtpEmailJob(job);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Login with OTP',
      template: 'login-otp',
    });

    expect(loggerSpy).toHaveBeenCalledWith('Login OTP email sent successfully to test@example.com');
  });

  it('should send an in-app notification email and log success', async () => {
    const job = mockJob({ mail: { to: 'test@example.com' } });
    const loggerSpy = jest.spyOn(emailQueueConsumer['logger'], 'log');

    await emailQueueConsumer.sendNotificationMail(job);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'In-App, Notification',
      template: 'login-otp',
    });

    expect(loggerSpy).toHaveBeenCalledWith('Notification email sent successfully to test@example.com');
  });
});
