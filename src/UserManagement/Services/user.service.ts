import { Repository } from 'typeorm';
import { User } from '../Models/user.entity';
import CreateUserInterface from '../TypeChecking/UserInterface';
import Hash from '../../../Helpers/Hash';
import { Injectable } from '@nestjs/common';
import UserIdentifierOptions from '../TypeChecking/UserIdentifierOptions';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>) { }

  async createUser(user: CreateUserInterface) {
    const password = await Hash.make(user.password);
    const userPayload = { ...user, password: password };
    const newUser = new User()

    Object.assign(newUser, userPayload)
    await this.userRepository.save(newUser)

  }

  private async getUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email: email } });
  }

  private async getUserByIdentifier(identifier: string) {
    return this.userRepository.findOne({ where: { identifier: identifier } });
  }

  private async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async getUserRecord(identifierOptions: UserIdentifierOptions) {
    const { identifier, identifierType } = identifierOptions

    const GetRecord = {
      id: async () => this.getUserById(Number(identifier)),
      identifier: async () => this.getUserByIdentifier(String(identifier)),
      email: async () => this.getUserByEmail(String(identifier))
    }

    return await GetRecord[identifierType]()
  }

}
