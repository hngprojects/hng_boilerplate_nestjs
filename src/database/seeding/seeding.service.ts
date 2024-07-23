import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);

    try {
      const existingUsers = await userRepository.count();
      if (existingUsers > 0) {
        console.log('Database is already populated. Skipping seeding.');
        return;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const u1 = userRepository.create({
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          password: 'password',
        });
        const u2 = userRepository.create({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'password',
        });

        await userRepository.save([u1, u2]);

        const savedUsers = await userRepository.find();
        if (savedUsers.length !== 2) {
          throw new Error('Failed to create all users');
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Seeding failed:', error.message);
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error('Error while checking for existing data:', error.message);
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return this.dataSource.getRepository(User).find();
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  }
}
