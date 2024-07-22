import { Test, TestingModule } from '@nestjs/testing';
import { HelpCenterController } from './help-center.controller';
import { HelpCenterService } from './help-center.service';

describe('Help Center Controller', () => {
  let helpCenterController: HelpCenterController;
  const mockService = {
    deleteTopic: jest.fn(),
  };
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HelpCenterController],
      providers: [HelpCenterService],
    })
      .overrideProvider(HelpCenterService)
      .useValue(mockService)
      .compile();

    helpCenterController = moduleRef.get<HelpCenterController>(HelpCenterController);
  });

  it('Should be defined', () => {
    expect(helpCenterController).toBeDefined();
  });

  it('Should delete a topic', async () => {
    const id = '06f2ec05-8269-407d-8e0a-d1348d03c863';
    const res = await helpCenterController.deleteTopic(id);
    expect(res).toEqual({ success: true, message: 'Topic delete successfully', status_code: 200 });
  });
});
