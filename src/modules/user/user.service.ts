import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  StreamableFile,
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
import { ReactivateAccountDto } from './dto/reactivate-account.dto';
import { pick } from '../../helpers/pick';
import { GetUserStatsResponseDto } from './dto/get-user-stats-response.dto';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { Readable, Writable } from 'stream';
import * as xlsx from 'xlsx';
import * as path from 'path';
import { Response } from 'express';
import { FileFormat, UserDataExportDto } from './dto/user-data-export.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';

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
      relations: ['profile', 'owned_organisations'],
    });
    return user;
  }

  private async getUserById(identifier: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({
      where: { id: identifier },
      relations: ['profile', 'owned_organisations'],
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
    // TODO: CHECK IF USER IS AN ADMIN
    if (currentUser.id !== userId) {
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

  async reactivateUser(email: string, reactivateAccountDto: ReactivateAccountDto) {
    const identifierOptions: UserIdentifierOptionsType = {
      identifier: email,
      identifierType: 'email',
    };

    const user = await this.getUserRecord(identifierOptions);

    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.is_active = true;
    user.attempts_left = 5;
    user.time_left = 30 * 60 * 1000;

    await this.userRepository.save(user);

    return {
      status: 'success',
      message: 'User Reactivated Successfully',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
      },
    };
  }

  async getUsersByAdmin(page: number = 1, limit: number = 10, currentUser: UserPayload): Promise<any> {
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomHttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.id !== authenticatedUserId) {
      throw new CustomHttpException('You are not authorized to delete this user', HttpStatus.UNAUTHORIZED);
    }

    await this.userRepository.softDelete(userId);

    return {
      status: 'success',
      message: 'Deletion in progress',
    };
  }

  // async getUserStatistics(currentUser: UserPayload): Promise<any> {
  // if (currentUser.user_type !== UserType.SUPER_ADMIN) {
  //   throw new ForbiddenException({
  //     error: 'Forbidden',
  //     message: 'You are not authorized to access user statistics',
  //   });
  // }
  async updateUserStatus(userId: string, status: string) {
    const keepColumns = ['id', 'created_at', 'updated_at', 'first_name', 'last_name', 'email', 'status'];
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'User not found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }
    const updatedUser = Object.assign(user, { status });
    const result = await this.userRepository.save(updatedUser);

    return {
      status: 'success',
      status_code: HttpStatus.OK,
      data: pick(result, keepColumns),
    };
  }

  async getUserStats(status?: string): Promise<GetUserStatsResponseDto> {
    const filters = {};

    if (status) {
      if (status === 'active') {
        filters['is_active'] = true;
      } else if (status === 'deleted') {
        filters['is_active'] = false;
      } else {
        throw new BadRequestException({
          error: 'Bad Request',
          message: SYS_MSG.BAD_REQUEST,
          status_code: HttpStatus.BAD_REQUEST,
        });
      }
    }

    const totalUsers = await this.userRepository.count();

    const activeUsers = status
      ? await this.userRepository.count({ where: { ...filters, is_active: true } })
      : await this.userRepository.count({ where: { is_active: true } });

    const deletedUsers = status
      ? await this.userRepository.count({ where: { ...filters, is_active: false } })
      : await this.userRepository.count({ where: { is_active: false } });

    return {
      status: 'success',
      status_code: 200,
      message: SYS_MSG.REQUEST_SUCCESSFUL,
      data: {
        total_users: totalUsers,
        active_users: activeUsers,
        deleted_users: deletedUsers,
      },
    };
  }

  async exportUserDataAsJsonOrExcelFile(format: FileFormat, userId: string, res: Response) {
    const stream = new Readable();
    const jsonData = { user: {} };
    const omitColumns: Array<keyof User> = ['password'];
    const relations = [
      'profile',
      'created_organisations',
      'owned_organisations',
      'blogs',
      'notifications',
      'testimonials',
    ];
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: this.userRepository.metadata.relations
        .filter(relation => relation.relationType === 'one-to-many')
        .map(relation => relation.propertyName),
    });

    for (const i in user) {
      if (omitColumns.includes(i as keyof User)) delete user[i];
      if (!relations.includes(i)) jsonData.user[i] = user[i];
      else jsonData[i] = user[i];
    }

    if (format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${userId}-data.xlsx"`);
      stream.push(this.generateExcelExportFile(jsonData));
      stream.push(null);
    } else if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${userId}-data.json"`);
      res.setHeader('Content-Type', 'application/json');
      stream.push(JSON.stringify(jsonData));
      stream.push(null);
    }

    const result = new StreamableFile(stream);
    return result;
  }

  private generateExcelExportFile(jsonData): Buffer {
    const workbook = xlsx.utils.book_new();

    function generateColumnsAndContents(data: object[], columnName: string) {
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, columnName);
    }

    for (const i in jsonData) {
      if (jsonData[i] === null) {
        generateColumnsAndContents([{ no: null, data: null, found: null }], i);
      } else if (!Array.isArray(jsonData[i])) {
        generateColumnsAndContents([jsonData[i]], i);
      } else if (Array.isArray(jsonData[i])) {
        if (jsonData[i].length === 0) {
          jsonData[i][0] = { no: null, data: null, found: null };
        }
        jsonData[i].forEach(entry => generateColumnsAndContents([entry], i));
      }
    }
    return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}
