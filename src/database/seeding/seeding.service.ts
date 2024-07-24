import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Invite } from '../../modules/invite/entities/invite.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { ProductCategory } from 'src/modules/product-category/entities/product-category.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);
    const inviteRepository = this.dataSource.getRepository(Invite);
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const productRepository = this.dataSource.getRepository(Product);
    const categoryRepository = this.dataSource.getRepository(ProductCategory);

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
        
        const c1 = categoryRepository.create({
          name: 'Category 1',
          description: 'Description for Category 1',
        });
        const c2 = categoryRepository.create({
          name: 'Category 2',
          description: 'Description for Category 2',
        });
        const c3 = categoryRepository.create({
          name: 'Category 3',
          description: 'Description for Category 3',
        });

        await categoryRepository.save([c1, c2, c3]);

        const p1 = productRepository.create({
          product_name: 'Product 1',
          description: 'Description for Product 1',
          quantity: 10,
          price: 100,
          user: u1,
          category: c1, 
        });
        const p2 = productRepository.create({
          product_name: 'Product 2',
          description: 'Description for Product 2',
          quantity: 20,
          price: 200,
          user: u2,
          category: c3, // Attach category c3 to p2
        });

        await productRepository.save([p1, p2]);

        // Update categories with the associated products
        c1.product = [p1];
        c2.product = [p1];
        c3.product = [p2];
        await categoryRepository.save([c1, c2, c3]);

        const savedProducts = await productRepository.find();
        if (savedProducts.length !== 2) {
          throw new Error('Failed to create all products');
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
