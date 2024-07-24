import { Injectable } from '@nestjs/common';
import { CreateTimezoneDto } from './dto/create-timezone.dto';

@Injectable()
export class TimezonesService {
  private readonly timezones: CreateTimezoneDto[] = [
    { id: '1', timezone: 'UTC' },
    { id: '2', timezone: 'GMT' },
    { id: '3', timezone: 'EST' },
    { id: '4', timezone: 'CST' },
    { id: '5', timezone: 'MST' },
    { id: '6', timezone: 'PST' },
    { id: '7', timezone: 'IST' },
  ];

  async getSupportedTimezones(): Promise<CreateTimezoneDto[]> {
    return this.timezones;
  }
}
