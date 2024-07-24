import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Waitlist } from '../../modules/waitlist/waitlist.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);
    const waitlistRepository = this.dataSource.getRepository(Waitlist)

    try {
      const existingUsers = await userRepository.count();
      if (existingUsers > 0) {
        Logger.log('Database is already populated. Skipping seeding.');
        return;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
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

      try {
        const waitlistExists = await waitlistRepository.count()
        if (waitlistExists > 0) {
          Logger.log('Database alrealdy populated with waitlist data, skipping...')
          return
        }
        const waitlists = [
          {
            email: 'me@example.com',
            fullName: 'John Doe'
          },
          {
            email: 'me@example.com1',
            fullName: 'John Dean'
          },
        ]
        const newWaitlists = await waitlistRepository.create(waitlists)
        await waitlistRepository.save(newWaitlists)
        const waitlistData = await userRepository.find();
        if (waitlistData.length !== 2) {
          throw new Error('Failed to create all waitlists');
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

}
