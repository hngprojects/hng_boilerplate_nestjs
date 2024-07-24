import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getUserData(user_id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id: user_id },
      relations: ['owned_organisations', 'created_organisations'],
    });
  }

  async exportToJson(user: User): Promise<string> {
    return JSON.stringify(user);
  }
}
