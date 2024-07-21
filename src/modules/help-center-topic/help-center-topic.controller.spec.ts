import { Test, TestingModule } from '@nestjs/testing';
import { HelpCenterTopicController } from './help-center-topic.controller';
import { HelpCenterTopicService } from './help-center-topic.service';

describe('HelpCenterTopicController', () => {
  let controller: HelpCenterTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpCenterTopicController],
      providers: [HelpCenterTopicService],
    }).compile();

    controller = module.get<HelpCenterTopicController>(HelpCenterTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
