import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('InvitationsService', () => {
  let service: InvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: JwtService, useValue: { sign: jest.fn() } }, // Mock JwtService
        { provide: ConfigService, useValue: { get: jest.fn() } }, // Mock ConfigService
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
