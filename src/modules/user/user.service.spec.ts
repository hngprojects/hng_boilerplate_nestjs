import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET, // Use environment variables for security
          signOptions: { expiresIn: '60m' }, // Token expiration time
        }),
        TypeOrmModule.forFeature([User]),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
