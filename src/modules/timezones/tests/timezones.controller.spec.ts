import { Test, TestingModule } from '@nestjs/testing';
import { TimezonesController } from '../timezones.controller';
import { TimezonesService } from '../timezones.service';
import { CreateTimezoneDto } from '../dto/create-timezone.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('TimezonesController', () => {
  let controller: TimezonesController;
  let service: TimezonesService;

  const mockTimezonesService = {
    getSupportedTimezones: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimezonesController],
      providers: [
        {
          provide: TimezonesService,
          useValue: mockTimezonesService,
        },
      ],
    }).compile();

    controller = module.get<TimezonesController>(TimezonesController);
    service = module.get<TimezonesService>(TimezonesService);
  });

  describe('getTimezonesWithoutAuth', () => {
    it('should return a list of timezones', async () => {
      const timezones: CreateTimezoneDto[] = [
        { id: '1', timezone: 'UTC' },
        { id: '2', timezone: 'America/New_York' },
      ];
      mockTimezonesService.getSupportedTimezones.mockResolvedValue(timezones);

      const result = await controller.getTimezonesWithoutAuth();
      expect(result).toEqual({
        status: 'success',
        status_code: 200,
        data: {
          timezones,
        },
      });
    });

    it('should handle errors appropriately', async () => {
      mockTimezonesService.getSupportedTimezones.mockRejectedValue(new UnauthorizedException());

      try {
        await controller.getTimezonesWithoutAuth();
      } catch (error) {
        expect(error.response).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      }
    });
  });
});
