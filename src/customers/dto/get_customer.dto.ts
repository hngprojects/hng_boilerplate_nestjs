// src/customers/dto/get-customer.dto.ts
import { IsUUID } from 'class-validator';

export class GetCustomerDto {
  @IsUUID()
  id: string;
}
