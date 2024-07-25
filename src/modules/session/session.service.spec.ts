import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionService } from './session.service';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import UserInterface from '../user/interfaces/UserInterface';
import * as useragent from 'useragent';

describe('SessionService', () => {
  let service: SessionService;
  let repository: Repository<Session>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(Session),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    repository = module.get<Repository<Session>>(getRepositoryToken(Session));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    const userAgentString =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
    const mockUser: Partial<UserInterface> = { id: 'user-id' };
    const hardcodedExpiresAt = new Date('2024-07-25T18:58:04.894Z');
    const mockCreateSessionDto: CreateSessionDto = {
      userId: 'user-id',
      expires_at: hardcodedExpiresAt,
      device_browser: 'Chrome',
      device_browser_version: '58.0.3029',
      device_os: 'Windows',
      device_os_version: '10.0.0',
      device_type: 'Other',
      device_brand: 'unknown',
      device_model: 'unknown',
    };

    it('should create a session and save it', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockCreateSessionDto as Session);
      jest.spyOn(repository, 'save').mockResolvedValue(mockCreateSessionDto as Session);

      const result = await service.createSession(mockUser, userAgentString);
      expect(result).toEqual(mockCreateSessionDto);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockCreateSessionDto,
          expires_at: expect.any(Date),
        })
      );
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockCreateSessionDto,
          expires_at: expect.any(Date),
        })
      );
    });

    it('should parse user agent string correctly', async () => {
      const deviceInfo = service['parseUserAgent'](userAgentString);
      expect(deviceInfo).toEqual({
        device_browser: 'Chrome',
        device_browser_version: '58.0.3029',
        device_os: 'Windows',
        device_os_version: '10.0.0',
        device_type: 'Other',
        device_brand: 'unknown',
        device_model: 'unknown',
      });
    });

    it('should handle unknown user agent string gracefully', async () => {
      const unknownUserAgentString = 'UnknownAgent/1.0';
      const deviceInfo = service['parseUserAgent'](unknownUserAgentString);
      expect(deviceInfo).toEqual({
        device_browser: 'Other',
        device_browser_version: '0.0.0',
        device_os: 'Other',
        device_os_version: '0.0.0',
        device_type: 'Other',
        device_brand: 'unknown',
        device_model: 'unknown',
      });
    });

    it('should handle empty user agent string gracefully', async () => {
      const emptyUserAgentString = '';
      const deviceInfo = service['parseUserAgent'](emptyUserAgentString);
      expect(deviceInfo).toEqual({
        device_browser: 'Other',
        device_browser_version: '0.0.0',
        device_os: 'Other',
        device_os_version: '0.0.0',
        device_type: 'Other',
        device_brand: 'unknown',
        device_model: 'unknown',
      });
    });
  });
});
