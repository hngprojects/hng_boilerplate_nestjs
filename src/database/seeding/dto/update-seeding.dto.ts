import { PartialType } from '@nestjs/swagger';
import { CreateSeedingDto } from './create-seeding.dto';

export class UpdateSeedingDto extends PartialType(CreateSeedingDto) {}
