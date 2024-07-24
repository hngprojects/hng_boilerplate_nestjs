import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistService } from '../waitlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from '../waitlist.entity';
import { CreateWaitlistUserDto } from '../dto/create-waitlist-user.dto';
import { MailerModule } from '@nestjs-modules/mailer';

describe('WaitlistService', () => {
  let service: WaitlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitlistService],
      imports: [TypeOrmModule.forFeature([Waitlist]), MailerModule],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a waitlist entry', async () => {
    const data: CreateWaitlistUserDto = {
      email: 'test@example.com',
      fullName: 'Test User',
    };
    const waitlistEntry = await service.create(data);
    expect(waitlistEntry).toHaveBeenCalledWith(expect.objectContaining(waitlistEntry));
    expect(waitlistEntry.user.id).toBeDefined();
    expect(waitlistEntry.user.created_at).toBeDefined();
  });
});
