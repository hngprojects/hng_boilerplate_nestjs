import { PartialType } from '@nestjs/swagger';
import { CreateInviteDto } from './create-invite.dto';

export class UpdateInviteDto extends PartialType(CreateInviteDto) {}
