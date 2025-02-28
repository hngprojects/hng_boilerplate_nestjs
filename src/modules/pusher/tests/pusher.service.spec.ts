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

  it('should trigger event successfully', async () => {
    const channel = 'test-channel';
    const event = 'test-event';
    const data = { message: 'test message' };

    await pusherService.triggerEvent(channel, event, data);

    expect(pusherInstance.trigger).toHaveBeenCalledWith(channel, event, data);
    expect(pusherInstance.trigger).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if Pusher fails', async () => {
    const channel = 'test-channel';
    const event = 'test-event';
    const data = { message: 'new notification' };

    (pusherInstance.trigger as jest.Mock).mockRejectedValue(new Error('Pusher Error'));
    await expect(pusherService.triggerEvent(channel, event, data)).rejects.toThrow('Pusher Error');

    expect(pusherInstance.trigger).toHaveBeenCalledWith(channel, event, data);
  });
});
