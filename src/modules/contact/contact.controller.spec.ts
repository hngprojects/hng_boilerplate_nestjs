import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: {
            contactUs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call contactUs with the correct DTO', async () => {
    const createContactDto: CreateContactDto = {
      name: 'Nicholas Duadei',
      email: 'nicholasduadei14',
      message: 'This is a test',
    };

    await controller.contactUs(createContactDto);
    expect(service.contactUs).toHaveBeenCalledWith(createContactDto);
  });
});
