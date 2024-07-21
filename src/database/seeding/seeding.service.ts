import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from 'src/database/entities/user.entity';
import { Profile } from 'src/database/entities/profile.entity';
import { Product } from 'src/database/entities/product.entity';
import { Organisation } from 'src/database/entities/organisation.entity';

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
        const profileRepository = this.dataSource.getRepository(Profile);
        const productRepository = this.dataSource.getRepository(Product);
        const organisationRepository = this.dataSource.getRepository(Organisation);

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

        const p1 = profileRepository.create({
          username: 'johnsmith',
          bio: 'bio data',
          phone: '1234567890',
          avatar_image: 'image.png',
          user: savedUsers[0],
        });
        const p2 = profileRepository.create({
          username: 'janesmith',
          bio: 'bio data',
          phone: '0987654321',
          avatar_image: 'image.png',
          user: savedUsers[1],
        });

        await profileRepository.save([p1, p2]);

        const savedProfiles = await profileRepository.find();
        if (savedProfiles.length !== 2) {
          throw new Error('Failed to create all profiles');
        }

        const pr1 = productRepository.create({
          product_name: 'Product 1',
          description: 'Description 1',
          product_price: 100,
          user: savedUsers[0],
        });
        const pr2 = productRepository.create({
          product_name: 'Product 2',
          description: 'Description 2',
          product_price: 200,
          user: savedUsers[1],
        });

        await productRepository.save([pr1, pr2]);

        const savedProducts = await productRepository.find();
        if (savedProducts.length !== 2) {
          throw new Error('Failed to create all products');
        }

        const or1 = organisationRepository.create({
          org_name: 'Org 1',
          description: 'Description 1',
          users: savedUsers,
        });
        const or2 = organisationRepository.create({
          org_name: 'Org 2',
          description: 'Description 2',
          users: [savedUsers[0]],
        });

        await organisationRepository.save([or1, or2]);

        const savedOrganisations = await organisationRepository.find();
        if (savedOrganisations.length !== 2) {
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
      return this.dataSource.getRepository(User).find({ relations: ['profile', 'products', 'organisations'] });
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      return this.dataSource.getRepository(Profile).find({ relations: ['user'] });
    } catch (error) {
      console.error('Error fetching profiles:', error.message);
      throw error;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return this.dataSource.getRepository(Product).find({ relations: ['user'] });
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw error;
    }
  }

  async getOrganisations(): Promise<Organisation[]> {
    try {
      return this.dataSource.getRepository(Organisation).find({ relations: ['users'] });
    } catch (error) {
      console.error('Error fetching organisations:', error.message);
      throw error;
    }
  }
}
