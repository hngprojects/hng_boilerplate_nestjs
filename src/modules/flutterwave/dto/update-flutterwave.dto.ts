import { PartialType } from '@nestjs/swagger';
import { CreateFlutterwaveDto } from './create-paymentplan.dto';

export class UpdateFlutterwaveDto extends PartialType(CreateFlutterwaveDto) {}
