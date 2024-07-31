import { PartialType } from '@nestjs/swagger';
import { CreateFlutterwaveDto } from './create-flutterwave.dto';

export class UpdateFlutterwaveDto extends PartialType(CreateFlutterwaveDto) {}
