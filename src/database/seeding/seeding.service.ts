import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Invite } from '../../modules/invite/entities/invite.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductCategory } from '../../modules/product-category/entities/product-category.entity';
import { Role } from '../../modules/organisation-role/entities/role.entity';
import { DefaultPermissions } from '../../modules/organisation-permissions/entities/default-permissions.entity';
import { PermissionCategory } from '../../modules/organisation-permissions/helpers/PermissionCategory';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);
    const inviteRepository = this.dataSource.getRepository(Invite);
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const productRepository = this.dataSource.getRepository(Product);
    const categoryRepository = this.dataSource.getRepository(ProductCategory);
    const defaultPermissionRepository = this.dataSource.getRepository(DefaultPermissions);
    const orgRoleRepository = this.dataSource.getRepository(Role);

    try {
      const existingPermissions = await defaultPermissionRepository.count();

      //Populate the database with default permissions if none exits else stop execution
      if (existingPermissions <= 0) {
        const defaultPermissions = Object.values(PermissionCategory).map(category =>
          defaultPermissionRepository.create({
            category,
            permission_list: false,
          })
        );

        await defaultPermissionRepository.save(defaultPermissions);
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const existingUsers = await userRepository.count();
      if (existingUsers > 0) {
        Logger.log('Database is already populated. Skipping seeding.');
        return;
      }

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

        // Save categories
        await categoryRepository.save([c1, c2, c3]);

        // Create products with associated categories
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

        const savedProducts = await productRepository.find({ relations: ['category'] });
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
        const savedCategories = await categoryRepository.find({ relations: ['products'] });
        if (savedCategories.length !== 3) {
          throw new Error('Failed to create all categories');
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
