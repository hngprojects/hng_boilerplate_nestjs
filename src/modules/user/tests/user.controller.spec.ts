import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import UserService from '../user.service';
import { NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    softDelete: jest.fn(),
  };

  const mockUser = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    is_active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('softDelete', () => {
    it('should return success response on valid deletion', async () => {
      mockUserService.softDelete.mockResolvedValue(mockUser);
      const response = await controller.softDelete('1', {});
      expect(response).toEqual({
        status: 'success',
        message: 'Account Deleted Successfully',
        updatedUserDto: {
          id: mockUser.id,
          name: `${mockUser.first_name} ${mockUser.last_name}`,
          email: mockUser.email,
        },
      });
    });

    it('should throw BadRequestException if user_id is not provided', async () => {
      await expect(controller.softDelete('', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw HttpException on error during softDelete', async () => {
      mockUserService.softDelete.mockRejectedValue(new Error());
      await expect(controller.softDelete('1', {})).rejects.toThrow(
        new HttpException(
          {
            status: 'error',
            message: 'Bad Request',
            status_code: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST
        )
      );
    });
  });
});
