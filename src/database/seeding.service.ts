import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';



@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) { }

  async seedDatabase() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Drop existing tables in the correct order
      // await queryRunner.query('DROP TABLE IF EXISTS "user_organisations_organisation" CASCADE');
      // await queryRunner.query('DROP TABLE IF EXISTS "organisation_users_user" CASCADE');
      // await queryRunner.query('DROP TABLE IF EXISTS "product" CASCADE');
      // await queryRunner.query('DROP TABLE IF EXISTS "profile" CASCADE');
      // await queryRunner.query('DROP TABLE IF EXISTS "organisation" CASCADE');
      // await queryRunner.query('DROP TABLE IF EXISTS "user" CASCADE');

      // Recreate the tables
      await this.dataSource.synchronize(false);

      // Seed data
      const userRepository = this.dataSource.getRepository(User);


      // Create new data
      const u1 = userRepository.create({
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        password: 'password',
      });
      const u2 = userRepository.create({
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password',
      });

      await userRepository.save([u1, u2]);

      // Check if users are saved
      const savedUsers = await userRepository.find();
      if (savedUsers.length !== 2) {
        throw new Error('Failed to create all users');
      }

      // const p1 = profileRepository.create({
      //   username: 'johnsmith',
      //   bio: 'bio data',
      //   phone: '1234567890',
      //   avatar_image: 'image.png',
      //   user: u1,
      // });
      // const p2 = profileRepository.create({
      //   username: 'janesmith',
      //   bio: 'bio data',
      //   phone: '0987654321',
      //   avatar_image: 'image.png',
      //   user: u2,
      // });

      // await profileRepository.save([p1, p2]);

      // Check if profiles are saved


      // Commit transaction if everything is successful
      await queryRunner.commitTransaction();
    } catch (error) {
      // Roll back the transaction if there is an error
      await queryRunner.rollbackTransaction();
      console.error('Seeding failed:', error.message);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async getUsers(): Promise<User[]> {
    return this.dataSource.getRepository(User).find({ relations: ['profile', 'products', 'organisations'] });
  }

}
