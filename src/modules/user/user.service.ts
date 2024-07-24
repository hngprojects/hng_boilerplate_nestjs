import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CreateNewUserOptions from './options/CreateNewUserOptions';
import UserIdentifierOptionsType from './options/UserIdentifierOptions';
import UserResponseDTO from './dto/user-response.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createUser(user: CreateNewUserOptions) {
    const newUser = new User();
    Object.assign(newUser, user);
    await this.userRepository.save(newUser);
  }

  private async getUserByEmail(email: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({ where: { email: email } });
    return user;
  }

  private async getUserById(identifier: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({ where: { id: identifier } });
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

    //send email to user about deactivation

    return { is_active: user.is_active, message: 'Account Deactivated Successfully' };
  }
}
