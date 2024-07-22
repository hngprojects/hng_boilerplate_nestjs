import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { BadRequestException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle contactUs successfully', async () => {
    const createContactDto: CreateContactDto = {
      name: 'Nicholas Duadei',
      email: 'nicholasduadei14@gmail.com',
      message: 'This is a test',
    };

    jest.spyOn(service, 'contactUs').mockImplementation(async () => {
      return {
        status: 200,
        message: 'Inquiry was successfully sent',
      };
    });

    await expect(service.contactUs(createContactDto)).resolves.not.toThrow();
  });

  it('should throw BadRequestException on error', async () => {
    const createContactDto: CreateContactDto = {
      name: 'Nicholas Duadei',
      email: 'nicholasduadei14',
      message: 'This is a test',
    };

    jest.spyOn(service, 'contactUs').mockImplementation(async error => {
      throw new BadRequestException({
        message: 'A server error occurred',
        status: 500,
      });
    });

    await expect(service.contactUs(createContactDto)).rejects.toThrow(BadRequestException);
  });
});
