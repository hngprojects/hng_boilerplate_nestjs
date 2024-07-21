import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { Product } from '../../entities/product.entity';
import { Organisation } from '../../entities/organisation.entity';
import { Revenue } from '../../entities/revenue.entity';

@Injectable()
export class SeedingService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Organisation) private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(Revenue) private readonly revenueRepository: Repository<Revenue>,
  ) {}

  async seedDatabase() {
    console.log('Starting database seeding...');
    const userRepository = this.dataSource.getRepository(User);

    try {
      const existingUsers = await userRepository.count();
      console.log(`Found ${existingUsers} existing users.`);
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
        const revenueRepository = this.dataSource.getRepository(Revenue);

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
        console.log(`Saved ${savedUsers.length} users.`);
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
        console.log(`Saved ${savedProfiles.length} profiles.`);
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
        console.log(`Saved ${savedProducts.length} products.`);
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
        console.log(`Saved ${savedOrganisations.length} organisations.`);
        if (savedOrganisations.length !== 2) {
          throw new Error('Failed to create all organisations');
        }

        const rev1 = revenueRepository.create({
          amount: 5000,
        });
        const rev2 = revenueRepository.create({
          amount: 7000,
        });

        await revenueRepository.save([rev1, rev2]);

        const savedRevenues = await revenueRepository.find();
        console.log(`Saved ${savedRevenues.length} revenue records.`);
        if (savedRevenues.length !== 2) {
          throw new Error('Failed to create all revenue records');
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
      return this.userRepository.find({ relations: ['profile', 'products', 'organisations'] });
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      return this.profileRepository.find({ relations: ['user'] });
    } catch (error) {
      console.error('Error fetching profiles:', error.message);
      throw error;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return this.productRepository.find({ relations: ['user'] });
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw error;
    }
  }

  async getOrganisations(): Promise<Organisation[]> {
    try {
      return this.organisationRepository.find({ relations: ['users'] });
    } catch (error) {
      console.error('Error fetching organisations:', error.message);
      throw error;
    }
  }

  async getRevenues(): Promise<Revenue[]> {
    return this.revenueRepository.find();
  }
}
