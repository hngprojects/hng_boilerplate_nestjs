import { PartialType } from '@nestjs/swagger';
import { CreateOrganisationRoleDto } from './create-organisation-role.dto';

export class UpdateOrganisationRoleDto extends PartialType(CreateOrganisationRoleDto) {}
