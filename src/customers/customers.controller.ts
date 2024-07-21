import { Controller, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { CustomerService } from './customers.service';


@Controller('/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Delete(':customerId')
//   needs auth and admin roles to ensure only admins can delete customers
  async softDeleteCustomer(@Param('customerId') customerId: number, @Req() req): Promise<any> {
    if (isNaN(customerId)) {
      return {
        message: 'Provide a valid customer ID',
        status_code: 400,
      };
    }

    await this.customerService.softDeleteCustomer(customerId);

    return {
      message: 'Customer deleted successfully',
      status_code: 200,
    };
  }
}
