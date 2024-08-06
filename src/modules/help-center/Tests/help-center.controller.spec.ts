import { Test, TestingModule } from '@nestjs/testing';
import { HelpCenterController } from '../help-center.controller';
import { HelpCenterService } from '../help-center.service';
import { CreateHelpCenterDto } from '../dto/create-help-center.dto';
import { UpdateHelpCenterDto } from '../dto/update-help-center.dto';
import { SuperAdminGuard } from '../../../guards/super-admin.guard';
import {
  NotFoundException,
  HttpStatus,
  HttpException,
  ForbiddenException,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import { HelpCenterEntity } from '../entities/help-center.entity';

describe('HelpCenterController', () => {
  let controller: HelpCenterController;
  let service: HelpCenterService;

  const mockHelpCenterService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    updateTopic: jest.fn(),
    removeTopic: jest.fn(),
  };

  class MockSuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: '1', user_type: 'SUPER_ADMIN' }; // Default to SUPER_ADMIN for most tests
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpCenterController],
      providers: [{ provide: HelpCenterService, useValue: mockHelpCenterService }],
    })
      .overrideGuard(SuperAdminGuard)
      .useValue(new MockSuperAdminGuard())
      .compile();

    controller = module.get<HelpCenterController>(HelpCenterController);
    service = module.get<HelpCenterService>(HelpCenterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return 422 if the input data is invalid', async () => {
      const invalidCreateHelpCenterDto: CreateHelpCenterDto = {
        title: '', // Invalid title
        content: 'Content',
      };

      jest.spyOn(service, 'create').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid input data.',
            status_code: HttpStatus.UNPROCESSABLE_ENTITY,
          },
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      });

      await expect(controller.create(invalidCreateHelpCenterDto)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Invalid input data.',
            status_code: HttpStatus.UNPROCESSABLE_ENTITY,
          },
          HttpStatus.UNPROCESSABLE_ENTITY
        )
      );
    });
  });

  describe('findAll', () => {
    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(service, 'findAll').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });

      await expect(controller.findAll()).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('findOne', () => {
    it('should return 404 if the topic is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne({ id: '1' })).rejects.toThrow(
        new NotFoundException('Help center topic with ID 1 not found')
      );
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(service, 'findOne').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });

      await expect(controller.findOne({ id: '1' })).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('update', () => {
    it('should return 401 if unauthorized', async () => {
      jest.spyOn(service, 'updateTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        );
      });

      await expect(controller.update('1', {} as UpdateHelpCenterDto)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        )
      );
    });

    it('should return 403 if access is denied', async () => {
      jest.spyOn(service, 'updateTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        );
      });

      await expect(controller.update('1', {} as UpdateHelpCenterDto)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        )
      );
    });

    it('should return 404 if the topic is not found', async () => {
      jest.spyOn(service, 'updateTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      });

      await expect(controller.update('1', {} as UpdateHelpCenterDto)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(service, 'updateTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });

      await expect(controller.update('1', {} as UpdateHelpCenterDto)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('remove', () => {
    it('should return 401 if unauthorized', async () => {
      jest.spyOn(service, 'removeTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        );
      });

      await expect(controller.remove('1')).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Unauthorized, please provide valid credentials',
            status_code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED
        )
      );
    });

    it('should return 403 if access is denied', async () => {
      jest.spyOn(service, 'removeTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        );
      });

      await expect(controller.remove('1')).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Access denied, only authorized users can access this endpoint',
            status_code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN
        )
      );
    });

    it('should return 404 if the topic is not found', async () => {
      jest.spyOn(service, 'removeTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        );
      });

      await expect(controller.remove('1')).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Topic not found, please check and try again',
            status_code: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should return 500 if an internal server error occurs', async () => {
      jest.spyOn(service, 'removeTopic').mockImplementation(() => {
        throw new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });

      await expect(controller.remove('1')).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
