import { Repository } from 'typeorm';
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ExportUserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getUserData(user_id: string): Promise<User> {
    if (!user_id) {
      throw new BadRequestException('User ID is required');
    }
    try {
      const user = await this.userRepository.findOne({
        where: { id: user_id },
        relations: ['owned_organisations', 'created_organisations'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('An error occured while fetching data');
    }
  }

  async exportToJson(user: User): Promise<string> {
    try {
      return JSON.stringify(user);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while exporting user data to JSON');
    }
  }
}
