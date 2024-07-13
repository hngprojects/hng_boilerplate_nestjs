import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';

@Module({
  imports: [PrismaModule],
})
export class CoreModule {}
