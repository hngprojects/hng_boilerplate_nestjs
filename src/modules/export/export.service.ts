import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ExportService {
  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  private userRepository;

  async getUserData(user_id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id: user_id },
      //relations: ['profile', 'products', 'organisations'],
    });
  }

  async exportToJson(user: User): Promise<string> {
    return JSON.stringify(user);
  }
}
