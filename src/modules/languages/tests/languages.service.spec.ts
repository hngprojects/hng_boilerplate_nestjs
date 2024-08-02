import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesService } from '../languages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../entities/language.entity';
import { CreateLanguageDto, UpdateLanguageDto } from '../dto/create-language.dto';
import { HttpException, HttpStatus, ConflictException, NotFoundException } from '@nestjs/common';

const mockLanguageRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
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
});
