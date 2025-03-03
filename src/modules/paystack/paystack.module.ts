import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { Payment } from './entities/payment.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Payment,User, Organisation, OrganisationUserRole, Role]), 
  ],
  controllers: [PaystackController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaystackModule {}
