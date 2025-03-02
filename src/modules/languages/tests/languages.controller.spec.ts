import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesController } from '../languages.controller';
import { LanguagesService } from '../languages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../entities/language.entity';
import { CreateLanguageDto } from '../dto/create-language.dto';
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { User } from '@modules/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

const mockLanguageRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockLanguagesService = {
  createLanguage: jest.fn(),
  getLanguagesById: jest.fn(),
  getSupportedLanguages: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('LanguagesController', () => {
  let controller: LanguagesController;
  let service: LanguagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        {
          provide: LanguagesService,
          useValue: mockLanguagesService,
        },
        {
          provide: getRepositoryToken(Language),
          useValue: mockLanguageRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<LanguagesController>(LanguagesController);
    service = module.get<LanguagesService>(LanguagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLanguage', () => {
    it('should successfully create a language', async () => {
      const createLanguageDto: CreateLanguageDto = {
        language: 'English',
        code: 'en',
        description: 'English',
      };

      const newLanguage = { ...createLanguageDto, id: 'some-id' };

      mockLanguagesService.createLanguage.mockResolvedValue({
        status_code: HttpStatus.CREATED,
        message: 'Language Created Successfully',
        language: newLanguage,
      });

      const result = await service.createLanguage(createLanguageDto);
      expect(result).toEqual({
        status_code: HttpStatus.CREATED,
        message: 'Language Created Successfully',
        language: newLanguage,
      });
    });

    it('should handle language already exists', async () => {
      const createLanguageDto: CreateLanguageDto = {
        language: 'English',
        code: 'en',
        description: 'English',
      };

      mockLanguagesService.createLanguage.mockResolvedValue({
        status_code: HttpStatus.CONFLICT,
        message: 'Language already exists',
      });

      const result = await service.createLanguage(createLanguageDto);
      expect(result).toEqual({
        status_code: HttpStatus.CONFLICT,
        message: 'Language already exists',
      });
    });

    it('should handle errors during creation', async () => {
      const createLanguageDto: CreateLanguageDto = {
        language: 'English',
        code: 'en',
        description: '',
      };

      mockLanguagesService.createLanguage.mockRejectedValue(
        new HttpException(
          {
            message: 'Error Occurred Performing this request',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      await expect(service.createLanguage(createLanguageDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Error Occurred Performing this request',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return a list of languages', async () => {
      const languages: Language[] = [
        {
          id: '1',
          language: 'English',
          code: 'en',
          description: 'English',
          created_at: undefined,
          updated_at: undefined,
        },
        {
          id: '2',
          language: 'Spanish',
          code: 'es',
          description: 'Español',
          created_at: undefined,
          updated_at: undefined,
        },
      ];

      mockLanguagesService.getSupportedLanguages.mockResolvedValue({
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        languages,
      });

      const result = await service.getSupportedLanguages();
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        languages,
      });
    });

    it('should handle errors during fetch', async () => {
      mockLanguagesService.getSupportedLanguages.mockRejectedValue(
        new HttpException(
          {
            message: 'Error Occurred while fetching languages',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      await expect(service.getSupportedLanguages()).rejects.toThrow(
        new HttpException(
          {
            message: 'Error Occurred while fetching languages',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('getLanguagesByUserId', () => {
    it('should return languages associated with a user', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const user = { id: 'user-id' } as User;

      const languages = [
        { id: '1', language: 'English', code: 'en', description: 'English' },
        { id: '2', language: 'Spanish', code: 'es', description: 'Español' },
      ];
      mockLanguagesService.getLanguagesById.mockResolvedValue({
        status: 'OK',
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        data: languages,
      });

      const req = { user };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await controller.getLanguagesByUserId(userId, req, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'OK',
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        data: languages,
      });
    });

    it('should handle invalid user ID', async () => {
      const userId = 'invalid-id';
      const user = { id: 'user-id' } as User;

      mockLanguagesService.getLanguagesById.mockRejectedValue(new BadRequestException('Invalid user Id'));

      const req = { user };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await expect(controller.getLanguagesByUserId(userId, req, res as any)).rejects.toThrow(BadRequestException);
    });

    it('should handle unauthorized access', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const user = { id: 'different-user-id' } as User;

      mockLanguagesService.getLanguagesById.mockRejectedValue(
        new ForbiddenException({
          status_code: HttpStatus.FORBIDDEN,
          message: 'You are not authorized to access this resource',
        })
      );

      const req = { user };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await expect(controller.getLanguagesByUserId(userId, req, res as any)).rejects.toThrow(ForbiddenException);
    });

    it('should handle no languages found for the user', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const user = { id: userId } as User;

      mockLanguagesService.getLanguagesById.mockRejectedValue(
        new NotFoundException({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Languages associated with this user not found',
        })
      );

      const req = { user };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await expect(controller.getLanguagesByUserId(userId, req, res as any)).rejects.toThrow(NotFoundException);
    });

    it('should handle no languages found for the user', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const user = { id: userId } as User;

      mockLanguagesService.getLanguagesById.mockRejectedValue(
        new NotFoundException({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Languages associated with this user not found',
        })
      );

      const req = { user };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await expect(controller.getLanguagesByUserId(userId, req, res as any)).rejects.toThrow(NotFoundException);
    });
  });
});
