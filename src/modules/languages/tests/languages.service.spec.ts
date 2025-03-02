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
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

describe('LanguagesService', () => {
  let service: LanguagesService;
  let repository: Repository<Language>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: getRepositoryToken(Language),
          useValue: mockLanguageRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository, // Add this line
        },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
    repository = module.get<Repository<Language>>(getRepositoryToken(Language));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
  });

  describe('getUserLanguages', () => {
    let languageService: LanguagesService;
    let languageRepository: Repository<Language>;
    let userRepository: Repository<User>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LanguagesService,
          {
            provide: getRepositoryToken(Language),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(User),
            useClass: Repository,
          },
        ],
      }).compile();

      languageService = module.get<LanguagesService>(LanguagesService);
      languageRepository = module.get<Repository<Language>>(getRepositoryToken(Language));
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
      expect(languageService).toBeDefined();
    });

    it('should return languages if user exists', async () => {
      const mockUser: User = {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        status: 'active',
        languages: [{ id: '1', language: 'English', code: 'en', description: 'English' }],
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await languageService.getUserLanguages('123');
      expect(result).toEqual(mockUser.languages);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(languageService.getUserLanguages('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserLanguage', () => {
    it('should delete a user-specific language successfully', async () => {
      const mockUser = { id: 'user123', languages: [{ id: 'lang123', language: 'English' }] } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'remove').mockResolvedValue(null);

      await expect(service.deleteUserLanguage('lang123', 'user123')).resolves.toEqual({
        message: 'Language successfully deleted for the user.',
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.deleteUserLanguage('lang123', 'user123')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if language is not found for user', async () => {
      const mockUser = { id: 'user123', languages: [] } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      await expect(service.deleteUserLanguage('lang123', 'user123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if language has dependencies', async () => {
      const mockUser = { id: 'user123', languages: [{ id: 'lang123', language: 'English' }] } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'remove').mockRejectedValue(new Error('Cannot delete'));

      await expect(service.deleteUserLanguage('lang123', 'user123')).rejects.toThrow(BadRequestException);
    });
  });
});
