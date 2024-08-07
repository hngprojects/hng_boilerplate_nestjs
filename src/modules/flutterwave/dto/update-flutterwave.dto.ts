import { PartialType } from '@nestjs/swagger';
import { CreateFlutterwavePaymentDto } from './create-flutterwavePaymentDto';

export class UpdateFlutterwaveDto extends PartialType(CreateFlutterwavePaymentDto) {}
