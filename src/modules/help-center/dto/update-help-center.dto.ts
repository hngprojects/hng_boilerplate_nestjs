import { PartialType } from '@nestjs/swagger';
import { updateHelp } from './updateHelp-center.dto';

export class UpdateHelpCenterDto extends PartialType(updateHelp) {}
