import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
