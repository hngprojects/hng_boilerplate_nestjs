import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { Product } from '../entities/products.entity';
import { Organisation } from '../entities/org.entity';
import { ProductCategory } from '../entities/product-categories.entity';
import { User } from '../entities/user.entity';

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
        const categroyRespository = this.dataSource.getRepository(ProductCategory);

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

        const p1 = profileRepository.create({
          username: 'johnsmith',
          bio: 'bio data',
          phone: '1234567890',
          avatarImage: 'image.png',
          user: savedUsers[0],
        });
        const p2 = profileRepository.create({
          username: 'janesmith',
          bio: 'bio data',
          phone: '0987654321',
          avatarImage: 'image.png',
          user: savedUsers[1],
        });

        await profileRepository.save([p1, p2]);

        const savedProfiles = await profileRepository.find();
        if (savedProfiles.length !== 2) {
          throw new Error('Failed to create all profiles');
        }

        const pcr1 = categroyRespository.create({ name: 'category1', description: 'description1', slug: 'slug1' });
        const pcr2 = categroyRespository.create({ name: 'category2', description: 'description2', slug: 'slug2' });

        await categroyRespository.save([pcr1, pcr2]);
        const savedCategory = await categroyRespository.find();

        const pr1 = productRepository.create({
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          currentStock: 50,
          inStock: true,
          category: savedCategory[0],
        });
        const pr2 = productRepository.create({
          name: 'Product 2',
          description: 'Description 2',
          price: 200,
          currentStock: 51,
          inStock: true,
          category: savedCategory[1],
        });

        await productRepository.save([pr1, pr2]);

        const savedProducts = await productRepository.find();
        if (savedProducts.length !== 2) {
          throw new Error('Failed to create all products');
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
