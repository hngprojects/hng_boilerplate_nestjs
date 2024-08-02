import { PartialType } from '@nestjs/swagger';
import { CreateSqueezePageDto } from './create-squeeze-pages.dto';

export class UpdateSqueezePageDto extends PartialType(CreateSqueezePageDto) {}
