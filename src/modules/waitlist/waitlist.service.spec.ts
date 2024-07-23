import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistService } from './waitlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from '../../database/entities/waitlist.entity';
import { DatabaseModule } from '../../database/database.module';

describe('WaitlistService', () => {
  let service: WaitlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitlistService],
      imports: [TypeOrmModule.forFeature([Waitlist])],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a waitlist entry', async () => {
    const data = {
      email: 'test@example.com',
      fullName: 'Test User',
    };
    const waitlistEntry = await service.create(data);
    expect(waitlistEntry).toMatchObject(data);
    expect(waitlistEntry.id).toBeDefined();
    expect(waitlistEntry.createdAt).toBeDefined();
  });
});
