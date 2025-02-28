// src/pusher/pusher.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  public pusher: Pusher;

  constructor(private readonly configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.get<string>('PUSHER_APP_ID'),
      key: this.configService.get<string>('PUSHER_APP_KEY'),
      secret: this.configService.get<string>('PUSHER_APP_SECRET'),
      cluster: this.configService.get<string>('PUSHER_APP_CLUSTER'),
      useTLS: true,
    });
  }

  async triggerEvent(channel: string, event: string, data: any) {
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      throw new Error('Pusher Error');
    }
  }
}
