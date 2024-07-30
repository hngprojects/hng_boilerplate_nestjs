import { Test, TestingModule } from '@nestjs/testing';
import { TimezonesController } from '../timezones.controller';
import { TimezonesService } from '../timezones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timezone } from '../entities/timezone.entity';
import { CreateTimezoneDto } from '../dto/create-timezone.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockTimezoneRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockTimezonesService = {
  createTimezone: jest.fn(),
  getSupportedTimezones: jest.fn(),
};

describe('TimezonesController', () => {
  let controller: TimezonesController;
  let service: TimezonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimezonesController],
      providers: [
        {
          provide: TimezonesService,
          useValue: mockTimezonesService,
        },
        {
          provide: getRepositoryToken(Timezone),
          useValue: mockTimezoneRepository,
        },
      ],
    }).compile();

    controller = module.get<TimezonesController>(TimezonesController);
    service = module.get<TimezonesService>(TimezonesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTimezone', () => {
    it('should successfully create a timezone', async () => {
      const createTimezoneDto: CreateTimezoneDto = {
        timezone: 'UTC',
        gmtOffset: '+00:00',
        description: 'Coordinated Universal Time',
      };

      const newTimezone = { ...createTimezoneDto, id: 'some-id' };

      mockTimezonesService.createTimezone.mockResolvedValue({
        status_code: HttpStatus.CREATED,
        message: 'Time Created Successfully',
        timezone: newTimezone,
      });

      const result = await service.createTimezone(createTimezoneDto);
      expect(result).toEqual({
        status_code: HttpStatus.CREATED,
        message: 'Time Created Successfully',
        timezone: newTimezone,
      });
    });

    it('should handle timezone already exists', async () => {
      const createTimezoneDto: CreateTimezoneDto = {
        timezone: 'UTC',
        gmtOffset: '+00:00',
        description: 'Coordinated Universal Time',
      };

      mockTimezonesService.createTimezone.mockResolvedValue({
        status_code: HttpStatus.CONFLICT,
        message: 'Timezone already exists',
      });

      const result = await service.createTimezone(createTimezoneDto);
      expect(result).toEqual({
        status_code: HttpStatus.CONFLICT,
        message: 'Timezone already exists',
      });
    });

    it('should handle errors during creation', async () => {
      const createTimezoneDto: CreateTimezoneDto = {
        timezone: 'UTC',
        gmtOffset: '',
      };

      mockTimezonesService.createTimezone.mockRejectedValue(
        new HttpException(
          {
            message: 'Error Occured Performing this request',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      await expect(service.createTimezone(createTimezoneDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Error Occured Performing this request',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('getSupportedTimezones', () => {
    it('should return a list of timezones', async () => {
      const timezones: Timezone[] = [
        {
          id: '1',
          timezone: 'UTC',
          gmtOffset: '+00:00',
          description: 'Coordinated Universal Time',
          created_at: undefined,
          updated_at: undefined,
        },
        {
          id: '2',
          timezone: 'America/New_York',
          gmtOffset: '-05:00',
          description: 'Eastern Standard Time',
          created_at: undefined,
          updated_at: undefined,
        },
      ];

      mockTimezonesService.getSupportedTimezones.mockResolvedValue({
        status_code: HttpStatus.OK,
        message: 'Timezone fetched successfully',
        timezones,
      });

      const result = await service.getSupportedTimezones();
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Timezone fetched successfully',
        timezones,
      });
    });

    it('should handle errors during fetch', async () => {
      mockTimezonesService.getSupportedTimezones.mockRejectedValue(
        new HttpException(
          {
            message: 'Error Occured while fetching timezones',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      await expect(service.getSupportedTimezones()).rejects.toThrow(
        new HttpException(
          {
            message: 'Error Occured while fetching timezones',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
