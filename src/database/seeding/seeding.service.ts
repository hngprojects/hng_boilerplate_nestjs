import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, UserType } from '../../modules/user/entities/user.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Invite } from '../../modules/invite/entities/invite.entity';
import { Profile } from '../../modules/profile/entities/profile.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);
    const profileRepository = this.dataSource.getRepository(Profile);
    const inviteRepository = this.dataSource.getRepository(Invite);
    const organisationRepository = this.dataSource.getRepository(Organisation);

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
          user_type: UserType.SUPER_ADMIN,
        });
        const u2 = userRepository.create({
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          password: 'password',
          user_type: UserType.SUPER_ADMIN,
        });

        await userRepository.save([u1, u2]);

        const savedUsers = await userRepository.find();
        if (savedUsers.length !== 2) {
          throw new Error('Failed to create all users');
        }

        const p1 = profileRepository.create({
          username: 'Johnsmith',
          email: 'john.smith@example.com',
          user: savedUsers[0],
        });
        const p2 = profileRepository.create({
          username: 'Janesmith',
          email: 'jane.smith@example.com',
          user: savedUsers[1],
        });

        await profileRepository.save([p1, p2]);

        const savedProfile = await userRepository.find();
        if (savedProfile.length !== 2) {
          throw new Error('Failed to create all profile');
        }

        const or1 = organisationRepository.create({
          name: 'Org 1',
          description: 'Description 1',
          email: 'test1@email.com',
          industry: 'industry1',
          type: 'type1',
          country: 'country1',
          state: 'state1',
          address: 'address1',
          owner: savedUsers[0],
          creator: savedUsers[0],
          isDeleted: false,
        });

        const or2 = organisationRepository.create({
          name: 'Org 2',
          description: 'Description 2',
          email: 'test2@email.com',
          industry: 'industry2',
          type: 'type2',
          country: 'country2',
          state: 'state2',
          address: 'address2',
          owner: savedUsers[0],
          creator: savedUsers[0],
          isDeleted: false,
        });

        await organisationRepository.save([or1, or2]);
        const savedOrganisations = await organisationRepository.find();
        if (savedOrganisations.length !== 2) {
          throw new Error('Failed to create all organisations');
        }

        const inv1 = inviteRepository.create({
          email: 'Org 1',
          status: 'pending',
          user: savedUsers[0],
          organisation: savedOrganisations[0],
        });

        const inv2 = inviteRepository.create({
          email: 'Org 1',
          status: 'pending',
          user: savedUsers[1],
          organisation: savedOrganisations[1],
        });

        await inviteRepository.save([inv1, inv2]);
        const savedInvite = await inviteRepository.find();
        if (savedInvite.length !== 2) {
          throw new Error('Failed to create all organisations');
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
      return this.dataSource.getRepository(User).find({ relations: ['organisations'] });
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  }
}
