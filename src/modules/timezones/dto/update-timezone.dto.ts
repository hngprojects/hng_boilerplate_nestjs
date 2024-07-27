import { PartialType } from '@nestjs/swagger';
import { CreateTimezoneDto } from './create-timezone.dto';

export class UpdateTimezoneDto extends PartialType(CreateTimezoneDto) {}
