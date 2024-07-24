import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CreateNewUserOptions from './options/CreateNewUserOptions';
import UserIdentifierOptionsType from './options/UserIdentifierOptions';
import UserResponseDTO from './dto/user-response.dto';
import UserInterface from './interfaces/UserInterface';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createUser(user: CreateNewUserOptions) {
    const newUser = new User();
    Object.assign(newUser, user);
    newUser.is_active = true;
    await this.userRepository.save(newUser);
  }

  async createUserSecret(user: UserResponseDTO) {
    await this.userRepository.save(user);
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
}
