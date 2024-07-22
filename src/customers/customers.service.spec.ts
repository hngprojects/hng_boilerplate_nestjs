// src/customers/customers.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { Repository } from 'typeorm';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: Repository<Customer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a customer by ID', async () => {
    const customer = new Customer();
    customer.id = '12345';
    jest.spyOn(repository, 'findOne').mockResolvedValue(customer);

    expect(await service.findOne('12345')).toEqual(customer);
  });

  it('should return null if customer is not found', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    expect(await service.findOne('12345')).toBeNull();
  });
});
