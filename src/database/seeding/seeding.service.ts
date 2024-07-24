import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductCategory } from '../../modules/product-category/entities/product-category.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);
    const productRepository = this.dataSource.getRepository(Product);
    const categoryRepository = this.dataSource.getRepository(ProductCategory);

    try {
      const existingUsers = await userRepository.count();
      const existingProducts = await productRepository.count();
      const existingCategories = await categoryRepository.count();

      if (existingUsers > 0 || existingProducts > 0 || existingCategories > 0) {
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
          category: [c1, c2], // Attach categories c1 and c2 to p1
        });
        const p2 = productRepository.create({
          product_name: 'Product 2',
          description: 'Description for Product 2',
          quantity: 20,
          price: 200,
          user: u2,
          category: [c3], // Attach category c3 to p2
        });

        await productRepository.save([p1, p2]);

        // Update categories with the associated products
        c1.product = p1;
        c2.product = p1;
        c3.product = p2;
        await categoryRepository.save([c1, c2, c3]);

        await queryRunner.commitTransaction();
        Logger.log('Database seeding completed successfully.');
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
}
