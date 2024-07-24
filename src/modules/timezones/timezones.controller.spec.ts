import { Test, TestingModule } from '@nestjs/testing';
import { TimezonesController } from './timezones.controller';
import { TimezonesService } from './timezones.service';

describe('TimezonesController', () => {
  let controller: TimezonesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimezonesController],
      providers: [TimezonesService],
    }).compile();

    controller = module.get<TimezonesController>(TimezonesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
