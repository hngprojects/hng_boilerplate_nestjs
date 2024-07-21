import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Entity } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { is_active: true } });
  }

  async findOne(id: any): Promise<User> {
    return this.userRepository.findOne({ where: { id, is_active: true } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email, is_active: true } });
  }

  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(id: number, user: Partial<User>): Promise<void> {
    await this.userRepository.update(id, user);
  }

  async softDelete(id: number): Promise<void> {
    await this.userRepository.update(id, { is_active: false });
  }
}
