import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { Product } from '../entities/product.entity';
import { Organisation } from '../entities/organisation.entity';
// import { User } from 'src/entities/user.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

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
      await this.dataSource.synchronize(true);

      // Seed data
      const userRepository = this.dataSource.getRepository(User);
      const profileRepository = this.dataSource.getRepository(Profile);
      const productRepository = this.dataSource.getRepository(Product);
      const organisationRepository = this.dataSource.getRepository(Organisation);

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

      console.log(savedUsers);

      const p1 = profileRepository.create({
        username: 'johnsmith',
        bio: 'bio data',
        phone: '1234567890',
        avatar_image: 'image.png',
        user: u1,
      });
      const p2 = profileRepository.create({
        username: 'janesmith',
        bio: 'bio data',
        phone: '0987654321',
        avatar_image: 'image.png',
        user: u2,
      });

      await profileRepository.save([p1, p2]);

      // Check if profiles are saved
      const savedProfiles = await profileRepository.find();
      if (savedProfiles.length !== 2) {
        throw new Error('Failed to create all profiles');
      }

      const pr1 = productRepository.create({
        product_name: 'Product 1',
        description: 'Description 1',
        product_price: 100,
        user: u1,
      });
      const pr2 = productRepository.create({
        product_name: 'Product 2',
        description: 'Description 2',
        product_price: 200,
        user: u2,
      });

      await productRepository.save([pr1, pr2]);

      // Check if products are saved
      const savedProducts = await productRepository.find();
      if (savedProducts.length !== 2) {
        throw new Error('Failed to create all products');
      }

      const or1 = organisationRepository.create({
        org_name: 'Org 1',
        description: 'Description 1',
        users: [u1, u2],
      });
      const or2 = organisationRepository.create({
        org_name: 'Org 2',
        description: 'Description 2',
        users: [u1],
      });

      await organisationRepository.save([or1, or2]);

      // Check if organisations are saved
      const savedOrganisations = await organisationRepository.find();
      if (savedOrganisations.length !== 2) {
        throw new Error('Failed to create all organisations');
      }

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

  async getProfiles(): Promise<Profile[]> {
    return this.dataSource.getRepository(Profile).find({
      relations: ['user'],
    });
  }

  async getProducts(): Promise<Product[]> {
    return this.dataSource.getRepository(Product).find({
      relations: ['user'],
    });
  }

  async getOrganisations(): Promise<Organisation[]> {
    return this.dataSource.getRepository(Organisation).find({
      relations: ['users'],
    });
  }
}
