import { User } from '@modules/user/entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLanguageDto, UpdateLanguageDto } from '../dto/create-language.dto';
import { Language } from '../entities/language.entity';
import { LanguagesService } from '../languages.service';

const mockLanguageRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
};

describe('LanguagesService', () => {
  let service: LanguagesService;
  let repository: Repository<Language>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: getRepositoryToken(Language),
          useValue: mockLanguageRepository,
        },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
    repository = module.get<Repository<Language>>(getRepositoryToken(Language));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLanguage', () => {
    it('should successfully create a language', async () => {
      const createLanguageDto: CreateLanguageDto = {
        language: 'English',
        code: 'en',
        description: 'English',
      };

      const newLanguage = {
        ...createLanguageDto,
        id: 'some-id',
        created_at: new Date(),
        updated_at: new Date(),
      } as Language;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(newLanguage);
      jest.spyOn(repository, 'save').mockResolvedValue(newLanguage);

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

      const existingLanguage = {
        ...createLanguageDto,
        id: 'some-id',
        created_at: new Date(),
        updated_at: new Date(),
      } as Language;

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingLanguage);

      await expect(service.createLanguage(createLanguageDto)).rejects.toThrow(
        new ConflictException({
          status_code: HttpStatus.CONFLICT,
          message: 'Language already exists',
        })
      );
    });

    it('should handle errors during creation', async () => {
      const createLanguageDto: CreateLanguageDto = {
        language: 'English',
        code: 'en',
        description: 'English',
      };

      jest.spyOn(repository, 'findOne').mockRejectedValue(
        new HttpException(
          {
            message: 'An error occurred',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      await expect(service.createLanguage(createLanguageDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'An error occurred',
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
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          language: 'Spanish',
          code: 'es',
          description: 'Español',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(languages);

      const result = await service.getSupportedLanguages();
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        languages: languages.map(language => ({
          language: `${language.language} (${language.description})`,
        })),
      });
    });

    it('should handle errors during fetch', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(
        new HttpException(
          {
            message: 'An error occurred',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      await expect(service.getSupportedLanguages()).rejects.toThrow(
        new HttpException(
          {
            message: 'An error occurred',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('updateLanguage', () => {
    it('should update a language', async () => {
      const id = 'some-id';
      const updateLanguageDto: UpdateLanguageDto = {
        language: 'English',
        code: 'en',
        description: 'English Language',
      };

      const updatedLanguage = {
        id,
        ...updateLanguageDto,
        created_at: new Date(),
        updated_at: new Date(),
      } as Language;

      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedLanguage);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedLanguage);

      const result = await service.updateLanguage(id, updateLanguageDto);
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Language successfully updated',
        language: updatedLanguage,
      });
    });

    it('should handle language not found', async () => {
      const id = 'non-existent-id';
      const updateLanguageDto: UpdateLanguageDto = {
        language: 'English',
        code: 'en',
        description: 'English Language',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.updateLanguage(id, updateLanguageDto)).rejects.toThrow(
        new NotFoundException({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Language not found',
        })
      );
    });

    it('should handle errors during update', async () => {
      const id = 'some-id';
      const updateLanguageDto: UpdateLanguageDto = {
        language: 'English',
        code: 'en',
        description: 'English Language',
      };

      jest.spyOn(repository, 'findOne').mockRejectedValue(
        new HttpException(
          {
            message: 'An error occurred',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );

      await expect(service.updateLanguage(id, updateLanguageDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'An error occurred',
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
      const user = {
        id: userId,
      } as User;

      const languages: Language[] = [
        {
          id: '1',
          language: 'English',
          code: 'en',
          description: 'English',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          language: 'Spanish',
          code: 'es',
          description: 'Español',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(languages),
      } as any);

      const result = await service.getLanguagesById(userId, user);
      expect(result).toEqual({
        status: 'OK',
        status_code: HttpStatus.OK,
        message: 'Languages fetched successfully',
        data: languages.map(language => ({
          id: language.id,
          language: language.language,
          description: language.description,
          code: language.code,
        })),
      });
    });

    it('should handle invalid user ID', async () => {
      const userId = 'invalid-id';
      const user = {
        id: 'user-id',
      } as User;

      await expect(service.getLanguagesById(userId, user)).rejects.toThrow(new BadRequestException('Invalid user Id'));
    });

    it('should handle unauthorized access', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const user = {
        id: '6a5db1d0-87c2-4602-a5a5-0ffacc2377d8',
      } as User;

      await expect(service.getLanguagesById(userId, user)).rejects.toThrow(
        new ForbiddenException({
          status_code: HttpStatus.FORBIDDEN,
          message: 'You are not authorized to access this resource',
        })
      );
    });

    it('should handle no languages found for the user', async () => {
      const userId = '6a5db1d0-87c2-4602-a5a5-0ffacc2377d8';
      const user = {
        id: userId,
      } as User;

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      await expect(service.getLanguagesById(userId, user)).rejects.toThrow(
        new NotFoundException({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Languages associated with this user not found',
        })
      );
    });

    it('should handle errors during fetch', async () => {
      const userId = '6a5db1d0-87c2-4602-a5a5-0ffacc2377d8';
      const user = {
        id: userId,
      } as User;

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('An error occurred')),
      } as any);

      await expect(service.getLanguagesById(userId, user)).rejects.toThrow(
        new InternalServerErrorException({
          message: 'An error occurred',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        })
      );
    });
  });
});
