import { PartialType } from '@nestjs/swagger';
import { CreateHelpCenterDto } from './create-help-center.dto';

export class UpdateHelpCenterDto extends PartialType(CreateHelpCenterDto) {}
