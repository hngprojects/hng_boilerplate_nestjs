import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
  Injectable,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entities/profile.entity';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import UpdateUserResponseDTO from './dto/update-user-response.dto';
import UserResponseDTO from './dto/user-response.dto';
import { User, UserType } from './entities/user.entity';
import { UserPayload } from './interfaces/user-payload.interface';
import CreateNewUserOptions from './options/CreateNewUserOptions';
import UpdateUserRecordOption from './options/UpdateUserRecordOption';
import UserIdentifierOptionsType from './options/UserIdentifierOptions';
import CustomExceptionHandler from '../../../src/helpers/exceptionHandler';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>
  ) {}

  async createUser(createUserPayload: CreateNewUserOptions): Promise<any> {
    const profile = await this.profileRepository.save({ email: createUserPayload.email, username: '' });
    const newUser = new User();
    Object.assign(newUser, createUserPayload);
    newUser.is_active = true;
    if (createUserPayload.admin_secret == process.env.ADMIN_SECRET_KEY) {
      newUser.user_type = UserType.SUPER_ADMIN;
    } else {
      newUser.user_type = UserType.USER;
    }
    newUser.profile = profile;
    return await this.userRepository.save(newUser);
  }

  async updateUserRecord(userUpdateOptions: UpdateUserRecordOption) {
    const { updatePayload, identifierOptions } = userUpdateOptions;
    const user = await this.getUserRecord(identifierOptions);
    Object.assign(user, updatePayload);
    await this.userRepository.save(user);
  }

  async getUserDataWithoutPasswordById(id: string) {
    const user = await this.getUserRecord({ identifier: id, identifierType: 'id' });

    const { password, ...userData } = user;

    return {
      status_code: 200,
      user: userData,
    };
  }

  public async createUserGoogle(userPayload) {
    const newUser = new User();
    const userData = {
      email: userPayload.email,
      name: `${userPayload.given_name} ${userPayload.family_name}`,
      first_name: userPayload.given_name,
      last_name: userPayload.family_name,
    };
    Object.assign(newUser, userData);
    newUser.is_active = true;
    return this.userRepository.save(newUser);
  }

  private async getUserByEmail(email: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({
      where: { email: email },
      relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
    });
    return user;
  }

  private async getUserById(identifier: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({
      where: { id: identifier },
      relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
    });
    return user;
  }

  async getUserRecord(identifierOptions: UserIdentifierOptionsType) {
    const { identifier, identifierType } = identifierOptions;

    const GetRecord = {
      id: async () => this.getUserById(String(identifier)),
      email: async () => this.getUserByEmail(String(identifier)),
    };

    return await GetRecord[identifierType]();
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUser: UserPayload
  ): Promise<UpdateUserResponseDTO> {
    if (!userId) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: 'UserId is required',
        status_code: HttpStatus.BAD_REQUEST,
      });
    }

    const identifierOptions: UserIdentifierOptionsType = {
      identifierType: 'id',
      identifier: userId,
    };
    const user = await this.getUserRecord(identifierOptions);
    if (!user) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'User not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }

    // Check if the current user is a super admin or the user being updated
    if (currentUser.user_type !== UserType.SUPER_ADMIN && currentUser.id !== userId) {
      throw new ForbiddenException({
        error: 'Forbidden',
        message: 'You are not authorized to update this user',
        status_code: HttpStatus.FORBIDDEN,
      });
    }

    try {
      Object.assign(user, updateUserDto);
      await this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException({
        error: 'Bad Request',
        message: 'Failed to update user',
        status_code: HttpStatus.BAD_REQUEST,
      });
    }

    return {
      status: 'success',
      message: 'User Updated Successfully',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
      },
    };
  }

  async deactivateUser(
    userId: string,
    deactivateAccountDto: DeactivateAccountDto
  ): Promise<{ is_active: boolean; message: string }> {
    const identifierOptions: UserIdentifierOptionsType = {
      identifier: userId,
      identifierType: 'id',
    };

    const user = await this.getUserRecord(identifierOptions);

    if (!user) {
      throw new HttpException({ status_code: 404, error: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    if (!deactivateAccountDto.confirmation) {
      throw new HttpException(
        {
          status_code: 400,
          error: 'Confirmation needs to be true for deactivation',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!user.is_active) {
      throw new HttpException({ status_code: 400, error: 'User has already been deactivated' }, HttpStatus.BAD_REQUEST);
    }

    user.is_active = false;

    await this.userRepository.save(user);

    return { is_active: user.is_active, message: 'Account Deactivated Successfully' };
  }

  async getUsersByAdmin(page: number = 1, limit: number = 10, currentUser: UserPayload): Promise<any> {
    if (currentUser.user_type !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException({
        error: 'Forbidden',
        message: 'Only super admins can access this endpoint',
        status_code: HttpStatus.FORBIDDEN,
      });
    }

    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'first_name', 'last_name', 'email', 'phone', 'is_active', 'created_at'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_users: total,
    };

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone_number: user.phone,
      is_active: user.is_active,
      created_at: user.created_at,
    }));

    return {
      status: 'success',
      message: 'Users retrieved successfully',
      data: {
        users: formattedUsers,
        pagination,
      },
    };
  }

  async softDeleteUser(userId: string, authenticatedUserId: string): Promise<any> {
    const identifierOptions: UserIdentifierOptionsType = {
      identifier: userId,
      identifierType: 'id',
    };

    const user = await this.getUserRecord(identifierOptions);

    if (!user) {
      CustomExceptionHandler(new NotFoundException('User not found'));
    }

    if (user.id !== authenticatedUserId) {
      CustomExceptionHandler(
        new UnauthorizedException({
          status: 'error',
          message: 'You are not authorized to delete this user',
          status_code: 401,
        })
      );
    }

    await this.userRepository.softDelete(userId);

    return {
      status: 'success',
      message: 'Deletion in progress',
    };
  }
}
