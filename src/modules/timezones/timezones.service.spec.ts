import { Test, TestingModule } from '@nestjs/testing';
import { TimezonesService } from './timezones.service';

describe('TimezonesService', () => {
  let service: TimezonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimezonesService],
    }).compile();

    service = module.get<TimezonesService>(TimezonesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
