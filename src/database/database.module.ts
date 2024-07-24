import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Waitlist } from 'src/modules/waitlist/waitlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Waitlist,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
