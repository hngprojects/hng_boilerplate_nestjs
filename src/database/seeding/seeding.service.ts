import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ADMIN_CREATED, INVALID_ADMIN_SECRET, SERVER_ERROR } from '../../helpers/SystemMessages';
import { Cart } from '../../modules/dashboard/entities/cart.entity';
import { OrderItem } from '../../modules/dashboard/entities/order-items.entity';
import { Order } from '../../modules/dashboard/entities/order.entity';
import { Transaction } from '../../modules/dashboard/entities/transaction.entity';
import { Invite } from '../../modules/invite/entities/invite.entity';
import { Notification } from '../../modules/notifications/entities/notifications.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { DefaultPermissions } from '../../modules/permissions/entities/default-permissions.entity';
import { PermissionCategory } from '../../modules/permissions/helpers/PermissionCategory';
import { ProductCategory } from '../../modules/product-category/entities/product-category.entity';
import { Product, ProductSizeType } from '../../modules/products/entities/product.entity';

import { Profile } from '../../modules/profile/entities/profile.entity';
import { Role } from '../../modules/role/entities/role.entity';
import { User } from '../../modules/user/entities/user.entity';
import { CreateAdminDto } from './dto/admin.dto';
import { CreateAdminResponseDto } from './dto/create-admin-response.dto';
import { OrganisationUserRole } from 'src/modules/role/entities/organisation-user-role.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);
    const profileRepository = this.dataSource.getRepository(Profile);
    const inviteRepository = this.dataSource.getRepository(Invite);
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const productRepository = this.dataSource.getRepository(Product);
    const categoryRepository = this.dataSource.getRepository(ProductCategory);
    const defaultPermissionRepository = this.dataSource.getRepository(DefaultPermissions);
    const notificationRepository = this.dataSource.getRepository(Notification);
    const defaultRoleRepository = this.dataSource.getRepository(Role);
    const organisationUserRoleRepository = this.dataSource.getRepository(OrganisationUserRole);

    try {
      const existingPermissions = await defaultPermissionRepository.count();
      const existingRoles = await defaultRoleRepository.count();

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

      //Populate the database with default Roles if none exits else stop execution
      // if (existingRoles <= 0) {
      //   const defaultRoles = Object.values(RoleCategory).map(name =>
      //     defaultRoleRepository.create({
      //       description: RoleCategoryDescriptions[name],
      //     })
      //   );

      //   // Save all default roles to the database
      //   await defaultRoleRepository.save(defaultRoles);
      // }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const existingUsers = await userRepository.count();
      if (existingUsers > 0) {
        Logger.log('Database is already populated. Skipping seeding.');
        return;
      }

      try {
        const roles1 = defaultRoleRepository.create({
          name: 'super-admin',
          description: '',
        });
        const roles2 = defaultRoleRepository.create({
          name: 'admin',
          description: '',
        });

        await defaultRoleRepository.save([roles1, roles2]);
        const savedRoles = await defaultRoleRepository.find();

        if (savedRoles.length !== 2) {
          throw new Error('Failed to create all roles');
        }

        const u1 = new User();
        const userObject1 = {
          first_name: 'Alpha',
          last_name: 'Smith',
          email: 'user1@admin.com',
          password: 'Password@1',
        };
        Object.assign(u1, userObject1);
        await userRepository.save(u1);

        const u2 = new User();
        const userObject2 = {
          first_name: 'Admin',
          last_name: 'User',
          email: 'user2@admin.com',
          password: 'Password@2',
        };
        Object.assign(u2, userObject2);
        await userRepository.save(u2);

        const u3 = new User();
        const userObject = {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'user3@admin.com',
          password: 'Password@3',
        };
        Object.assign(u3, userObject);
        await userRepository.save(u3);

        const savedUsers = await userRepository.find();

        if (savedUsers.length !== 3) {
          throw new Error('Failed to create all users');
        }

        const prf1 = profileRepository.create({
          username: 'Johnsmith',
          email: 'john.smith@example.com',
        });
        const prf2 = profileRepository.create({
          username: 'Janesmith',
          email: 'jane.smith@example.com',
        });

        await profileRepository.save([prf1, prf2]);
        const savedProfiles = await profileRepository.find();

        if (savedProfiles.length !== 2) {
          throw new Error('Failed to create all profiles');
        }

        savedUsers[0].profile = savedProfiles[0];
        savedUsers[1].profile = savedProfiles[1];

        await userRepository.save(savedUsers);

        const usr_org_rol1 = organisationUserRoleRepository.create({
          userId: savedUsers[0].id,
          roleId: savedRoles[0].id,
        });
        const usr_org_rol2 = organisationUserRoleRepository.create({
          userId: savedUsers[1].id,
          roleId: savedRoles[0].id,
        });
        const usr_org_rol3 = organisationUserRoleRepository.create({
          userId: savedUsers[2].id,
          roleId: savedRoles[0].id,
        });

        await organisationUserRoleRepository.save([usr_org_rol1, usr_org_rol2, usr_org_rol3]);
        const savedUsrRole = await profileRepository.find();

        if (savedUsrRole.length !== 3) {
          throw new Error('Failed to create all User Org roles');
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
          name: 'Product 1',
          description: 'Description for Product 1',
          size: ProductSizeType.STANDARD,
          category: 'electricity',
          quantity: 1,
          price: 500,
          org: or1,
        });
        const p2 = productRepository.create({
          name: 'Product 2',
          description: 'Description for Product 2',
          size: ProductSizeType.LARGE,
          category: 'electricity',
          quantity: 2,
          price: 50,
          org: or2,
        });
        const p3 = productRepository.create({
          name: 'Product 2',
          description: 'Description for Product 2',
          size: ProductSizeType.STANDARD,
          category: 'electricity',
          quantity: 2,
          price: 50,
          org: or1,
        });
        const p4 = productRepository.create({
          name: 'Product 2',
          description: 'Description for Product 2',
          size: ProductSizeType.SMALL,
          category: 'clothing',
          quantity: 2,
          price: 50,
          org: or2,
        });

        await productRepository.save([p1, p2, p3, p4]);

        const savedProducts = await productRepository.find({ relations: ['category'] });
        if (savedProducts.length !== 4) {
          throw new Error('Failed to create all products');
        }

        const inv1 = inviteRepository.create({
          organisation: savedOrganisations[0],
          isGeneric: true,
          isAccepted: false,
          token: uuidv4(),
        });

        const inv2 = inviteRepository.create({
          isGeneric: true,
          isAccepted: false,
          token: uuidv4(),
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

        const notifications = [
          notificationRepository.create({
            message: 'Notification 1 for John',
            user: savedUsers[0],
          }),
          notificationRepository.create({
            message: 'Notification 2 for John',
            user: savedUsers[0],
          }),
          notificationRepository.create({
            message: 'Notification 1 for Jane',
            user: savedUsers[1],
          }),
          notificationRepository.create({
            message: 'Notification 2 for Jane',
            user: savedUsers[1],
          }),
        ];

        await notificationRepository.save(notifications);
        const savedNotifications = await notificationRepository.find();
        if (savedNotifications.length !== 4) {
          throw new Error('Failed to create all notifications');
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
      console.log('Error fetching users:', error);
      throw new BadRequestException('Error fetching users');
    }
  }

  async createSuperAdmin({ secret, ...adminDetails }: CreateAdminDto): Promise<CreateAdminResponseDto> {
    try {
      const userRepository = this.dataSource.getRepository(User);
      const exists = await userRepository.findOne({ where: { email: adminDetails.email } });
      if (exists) throw new ConflictException('A user already exist with the same email');

      const user = userRepository.create(adminDetails);
      const { ADMIN_SECRET } = process.env;
      if (secret !== ADMIN_SECRET) throw new UnauthorizedException(INVALID_ADMIN_SECRET);

      // user.user_type = UserType.SUPER_ADMIN;
      const admin = await userRepository.save(user);
      return { status: 201, message: ADMIN_CREATED, data: admin };
    } catch (error) {
      console.log('Error creating superAdmin:', error);
      if (error instanceof UnauthorizedException || error instanceof ConflictException) throw error;
      throw new InternalServerErrorException(SERVER_ERROR);
    }
  }

  async seedTransactions() {
    const cartRepository = this.dataSource.getRepository(Cart);
    const orderRepository = this.dataSource.getRepository(Order);
    const orderItemRepository = this.dataSource.getRepository(OrderItem);
    const transactionRepository = this.dataSource.getRepository(Transaction);
    const userRepository = this.dataSource.getRepository(User);
    const productRepository = this.dataSource.getRepository(Product);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const savedUsers = await userRepository.find();
    const savedProducts = await productRepository.find();

    const orders = [
      orderRepository.create({
        user: savedUsers[0],
        total_price: 1000,
      }),
      orderRepository.create({
        user: savedUsers[1],
        total_price: 1500,
      }),
      orderRepository.create({
        user: savedUsers[0],
        total_price: 750,
      }),
      orderRepository.create({
        user: savedUsers[1],
        total_price: 1250,
      }),
      orderRepository.create({
        user: savedUsers[0],
        total_price: 2000,
      }),
    ];

    await orderRepository.save(orders);

    const orderItems = [
      orderItemRepository.create({
        order: orders[0],
        product: savedProducts[0],
        quantity: 2,
        total_price: 500,
      }),
      orderItemRepository.create({
        order: orders[1],
        product: savedProducts[1],
        quantity: 3,
        total_price: 1500,
      }),
      orderItemRepository.create({
        order: orders[2],
        product: savedProducts[2],
        quantity: 1,
        total_price: 750,
      }),
      orderItemRepository.create({
        order: orders[3],
        product: savedProducts[0],
        quantity: 5,
        total_price: 1250,
      }),
      orderItemRepository.create({
        order: orders[4],
        product: savedProducts[1],
        quantity: 4,
        total_price: 2000,
      }),
    ];

    await orderItemRepository.save(orderItems);

    const carts = [
      cartRepository.create({
        user: savedUsers[0],
        product: savedProducts[0],
        quantity: 1,
      }),
      cartRepository.create({
        user: savedUsers[1],
        product: savedProducts[1],
        quantity: 2,
      }),
      cartRepository.create({
        user: savedUsers[0],
        product: savedProducts[2],
        quantity: 1,
      }),
      cartRepository.create({
        user: savedUsers[1],
        product: savedProducts[0],
        quantity: 3,
      }),
      cartRepository.create({
        user: savedUsers[0],
        product: savedProducts[1],
        quantity: 2,
      }),
    ];

    await cartRepository.save(carts);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthDate = (day: number) => new Date(currentYear, currentMonth, day);
    const previousMonthDate = (day: number) => new Date(currentYear, currentMonth - 1, day);

    const transactions = [
      transactionRepository.create({
        order: orders[0],
        amount: 1000,
        date: currentMonthDate(1),
      }),
      transactionRepository.create({
        order: orders[1],
        amount: 1500,
        date: currentMonthDate(10),
      }),
      transactionRepository.create({
        order: orders[2],
        amount: 750,
        date: currentMonthDate(20),
      }),
      transactionRepository.create({
        order: orders[3],
        amount: 1250,
        date: previousMonthDate(1),
      }),
      transactionRepository.create({
        order: orders[4],
        amount: 2000,
        date: previousMonthDate(15),
      }),
    ];

    await transactionRepository.save(transactions);

    await queryRunner.commitTransaction();
  }
}
