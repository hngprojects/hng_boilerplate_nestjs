import { Test, TestingModule } from '@nestjs/testing';
import { FlutterwaveController } from './flutterwave.controller';
import { FlutterwaveService } from './flutterwave.service';

describe('FlutterwaveController', () => {
  let controller: FlutterwaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlutterwaveController],
      providers: [FlutterwaveService],
    }).compile();

    controller = module.get<FlutterwaveController>(FlutterwaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
