// src/customers/customers.controller.ts
import { Controller, Get, Param, UseGuards, Req, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { GetCustomerDto } from './dto/get-customer.dto';

@Controller('api/v1/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCustomer(@Param() params: GetCustomerDto) {
    const customer = await this.customersService.findOne(params.id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return {
      status_code: 200,
      data: customer,
    };
  }
}
