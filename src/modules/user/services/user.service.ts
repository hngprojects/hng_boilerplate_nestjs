import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CreateNewUserOptions from '../options/CreateNewUserOptions';
import UserIdentifierOptions from '../options/UserIdentifierOptions';
import UserResponseDTO from '../dto/user-response.dto';


@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>) { }

  async createUser(user: CreateNewUserOptions) {

    const newUser = new User()
    Object.assign(newUser, user)
    await this.userRepository.save(newUser)
  }

  private async getUserByEmail(email: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({ where: { email: email } });
    return user
  }

  private async getUserById(identifier: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({ where: { id: identifier } });
    return user
  }

  async getUserRecord(identifierOptions: UserIdentifierOptions) {
    const { identifier, identifierType } = identifierOptions

    const GetRecord = {
      id: async () => this.getUserById(String(identifier)),
      email: async () => this.getUserByEmail(String(identifier))
    }

    return await GetRecord[identifierType]()
  }

}
