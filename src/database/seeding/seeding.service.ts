import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Profile } from 'src/entities/profile.entity';
import { Product } from 'src/entities/product.entity';
import { Organisation } from 'src/entities/organisation.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async send() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getId(User);
      const profileRepository = queryRunner.manager.getId(Profile);
      const productRepository = queryRunner.manager.getId(Product);
      const organisationRepository = queryRunner.manager.getId(Organisation);

      const users = await userRepository.find();
      await userRepository.remove(User);
      const profile = await profileRepository.find();
      await profileRepository.remove(Profile);
      const product = await productRepository.find();
      await productRepository.remove(Product);
      const organisation = await organisationRepository.find();
      await organisationRepository.remove(Organisation);

      const u1 = userRepository.create({ name: 'first_name' });
      const u2 = userRepository.create({ name: 'last_name' });
      const u3 = userRepository.create({ name: 'email' });
      const u4 = userRepository.create({ name: 'password' });
      const u5 = userRepository.create({ name: 'created_at' });
      const u6 = userRepository.create({ name: 'updated_at' });

      await userRepository.save([u1, u2, u3, u4]);

      const p1 = profileRepository.create({ name: 'first_name' });
      const p2 = profileRepository.create({ name: 'last_name' });
      const p3 = profileRepository.create({ name: 'email' });
      const p4 = profileRepository.create({ name: 'phone' });
      const p5 = profileRepository.create({ name: 'avatar_image' });

      await profileRepository.save([p1, p2, p3, p4, p5]);

      const pr1 = productRepository.create({ name: 'product_name' });
      const pr2 = productRepository.create({ name: 'product_price' });
      const pr3 = productRepository.create({ name: 'description' });

      await productRepository.save([pr1, pr2, pr3]);

      const or1 = profileRepository.create({ name: 'org_name' });
      const or2 = profileRepository.create({ name: 'description' });

      await organisationRepository.save([p1, p2, p3, p4, p5]);

      const pro1 = productRepository.create({
        product_name: '',
        description: '',
        product_price: '',
        user: '',
      });
      const prof = profileRepository.create({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        avatar_image: '',
        user: '',
      });
      const org = organisationRepository.create({
        org_name: '',
        description: '',
        user: [],
      });
      const usr = userRepository.create({
        first_name: 'Gaming PC',
        last_name: 'experience.',
        email: '',
        password: '',
        created_at: '',
        updated_at: '',
        organisation: [],
      });

      await userRepository.save([usr]);
      await productRepository.save([pro1]);
      await organisationRepository.save([org]);
      await profileRepository.save([prof]);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUsers(): Promise<User[]> {
    return this.dataSource.getRepository(User).find();
  }

  async getProfiles(): Promise<Profile[]> {
    return this.dataSource.getRepository(Profile).find();
  }

  async getProducts(): Promise<Product[]> {
    return this.dataSource.getRepository(Product).find();
  }

  async getOrganisations(): Promise<Organisation[]> {
    return this.dataSource.getRepository(Organisation).find();
  }
}
