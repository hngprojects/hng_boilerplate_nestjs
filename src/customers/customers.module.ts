import { Module } from '@nestjs/common';
import { CustomerController } from './customers.controller';
import { CustomerService } from './customers.service';


@Module({
    imports: [],
    controllers: [CustomerController],
    providers: [CustomerService],
  })
  export class CustomersModule {}