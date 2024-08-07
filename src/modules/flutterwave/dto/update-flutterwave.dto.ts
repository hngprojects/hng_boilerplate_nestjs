import { PartialType } from '@nestjs/swagger';
import { CreateFlutterwavePaymentDto } from './create-flutterwave-payment.dto';

export class UpdateFlutterwaveDto extends PartialType(CreateFlutterwavePaymentDto) {}
