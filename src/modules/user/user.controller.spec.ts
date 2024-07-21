import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
// import dataSource from '../../database/data-source';

describe('UserController', () => {
  let controller: UserController;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET, // Use environment variables for security
          signOptions: { expiresIn: '60m' }, // Token expiration time
        }),
      ],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  }, 100000);

  it('should return healthy endpoint', async () => {
    const result = 'healthy endpoint';
  });
});
