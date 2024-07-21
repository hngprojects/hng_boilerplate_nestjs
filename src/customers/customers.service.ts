import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from 'src/entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async softDeleteCustomer(customerId: number): Promise<void> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId, isDeleted: false } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    customer.isDeleted = true;
    await this.customerRepository.save(customer);
  }
}
