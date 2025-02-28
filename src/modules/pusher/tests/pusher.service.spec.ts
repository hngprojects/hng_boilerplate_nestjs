import { Test, TestingModule } from '@nestjs/testing';
import { PusherService } from '../pusher.service';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      PUSHER_APP_ID: 'testAppId',
      PUSHER_APP_KEY: 'testAppKey',
      PUSHER_APP_SECRET: 'testAppSecret',
      PUSHER_APP_CLUSTER: 'testCluster',
    };
    return config[key];
  }),
};

jest.mock('pusher', () => {
  return jest.fn().mockImplementation(() => ({
    trigger: jest.fn().mockResolvedValue(true),
  }));
});

describe('PusherService', () => {
  let pusherService: PusherService;
  let pusherInstance: Pusher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PusherService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    pusherService = module.get<PusherService>(PusherService);
    pusherInstance = module.get<PusherService>(PusherService).pusher;
  });

  it('should be defined', () => {
    expect(pusherService).toBeDefined();
  });

  it('should call pusher trigger method with correct parameters', async () => {
    const channel = 'test-channel';
    const event = 'test-event';
    const data = { message: 'test message' };

    await pusherService.triggerEvent(channel, event, data);

    expect(pusherInstance.trigger).toHaveBeenCalledWith(channel, event, data);
    expect(pusherInstance.trigger).toHaveBeenCalledTimes(1);
  });

  it('should log success message when event is triggered successfully', async () => {
    const channel = 'test-channel';
    const event = 'test-event';
    const data = { message: 'test message' };

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await pusherService.triggerEvent(channel, event, data);

    expect(consoleSpy).toHaveBeenCalledWith('Notifications sent to pusher successfully');

    consoleSpy.mockRestore();
  });

  it('should log error when pusher trigger fails', async () => {
    (pusherInstance.trigger as jest.Mock).mockRejectedValueOnce(new Error('Pusher Error'));

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const channel = 'test-channel';
    const event = 'test-event';
    const data = { message: 'test message' };

    await pusherService.triggerEvent(channel, event, data);

    expect(consoleSpy).toHaveBeenCalledWith(new Error('Pusher Error'));

    consoleSpy.mockRestore();
  });
});
