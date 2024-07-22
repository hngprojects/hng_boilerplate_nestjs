import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { Faqs } from 'src/database/entities/faqs.entity';
import { RoleGuard } from '../auth/role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Faqs])],
  controllers: [FaqsController],
  providers: [FaqsService, RoleGuard],
})
export class FaqsModule {}
